import { EventEmitter } from 'events'
import { Server } from 'socket.io'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'
import { MQTTService } from './mqttService'
import { SensorManager } from './sensorManager'

export interface DashboardClient {
  id: string
  userId: string
  farmIds: string[]
  permissions: string[]
  connectedAt: Date
  lastSeen: Date
}

export interface RealTimeUpdate {
  type: 'sensor_data' | 'alert' | 'device_status' | 'system_health'
  data: any
  timestamp: Date
  farmId?: string
  sensorId?: string
}

export class DashboardBridge extends EventEmitter {
  private io: Server
  private database: LocalDatabase
  private mqttService: MQTTService
  private sensorManager: SensorManager
  private connectedClients: Map<string, DashboardClient> = new Map()
  private subscriptions: Map<string, Set<string>> = new Map() // socketId -> Set of farmIds
  private isRunning = false

  constructor(
    io: Server,
    database: LocalDatabase,
    mqttService: MQTTService,
    sensorManager: SensorManager
  ) {
    super()
    this.io = io
    this.database = database
    this.mqttService = mqttService
    this.sensorManager = sensorManager
  }

  async start(): Promise<void> {
    try {
      this.isRunning = true
      this.setupSocketHandlers()
      this.setupDataStreams()
      this.startHealthMonitoring()
      
      logger.info('Dashboard Bridge started')
    } catch (error) {
      logger.error('Failed to start Dashboard Bridge:', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false
    this.connectedClients.clear()
    this.subscriptions.clear()
    
    logger.info('Dashboard Bridge stopped')
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Dashboard client connected: ${socket.id}`)

      // Handle client authentication and registration
      socket.on('dashboard_auth', async (authData) => {
        await this.handleClientAuth(socket, authData)
      })

      // Handle farm subscription
      socket.on('subscribe_farms', (farmIds: string[]) => {
        this.handleFarmSubscription(socket, farmIds)
      })

      // Handle real-time sensor data requests
      socket.on('subscribe_sensors', (sensorIds: string[]) => {
        this.handleSensorSubscription(socket, sensorIds)
      })

      // Handle dashboard queries
      socket.on('dashboard_query', async (query) => {
        await this.handleDashboardQuery(socket, query)
      })

      // Handle device control commands
      socket.on('device_command', async (command) => {
        await this.handleDeviceCommand(socket, command)
      })

      // Handle client disconnect
      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket)
      })

      // Send initial connection status
      socket.emit('connection_status', {
        connected: true,
        timestamp: new Date(),
        services: {
          database: this.database.isConnected,
          mqtt: this.mqttService.isConnected,
          sensors: this.sensorManager.isActive
        }
      })
    })
  }

  private async handleClientAuth(socket: any, authData: any): Promise<void> {
    try {
      // Validate authentication token
      const isValid = await this.validateAuthToken(authData.token)
      
      if (!isValid) {
        socket.emit('auth_error', { error: 'Invalid authentication token' })
        socket.disconnect()
        return
      }

      // Register client
      const client: DashboardClient = {
        id: socket.id,
        userId: authData.userId,
        farmIds: authData.farmIds || [],
        permissions: authData.permissions || [],
        connectedAt: new Date(),
        lastSeen: new Date()
      }

      this.connectedClients.set(socket.id, client)
      
      socket.emit('auth_success', {
        clientId: socket.id,
        permissions: client.permissions
      })

      logger.info(`Dashboard client authenticated: ${authData.userId}`)
    } catch (error) {
      logger.error('Client authentication error:', error)
      socket.emit('auth_error', { error: 'Authentication failed' })
    }
  }

  private handleFarmSubscription(socket: any, farmIds: string[]): void {
    const client = this.connectedClients.get(socket.id)
    if (!client) return

    // Update client farm subscriptions
    client.farmIds = farmIds
    this.subscriptions.set(socket.id, new Set(farmIds))

    // Join socket to farm-specific rooms
    farmIds.forEach(farmId => {
      socket.join(`farm_${farmId}`)
    })

    socket.emit('subscription_confirmed', { farmIds })
    logger.debug(`Client ${socket.id} subscribed to farms: ${farmIds.join(', ')}`)
  }

  private handleSensorSubscription(socket: any, sensorIds: string[]): void {
    // Join socket to sensor-specific rooms
    sensorIds.forEach(sensorId => {
      socket.join(`sensor_${sensorId}`)
    })

    socket.emit('sensor_subscription_confirmed', { sensorIds })
    logger.debug(`Client ${socket.id} subscribed to sensors: ${sensorIds.join(', ')}`)
  }

  private async handleDashboardQuery(socket: any, query: any): Promise<void> {
    try {
      const client = this.connectedClients.get(socket.id)
      if (!client) return

      let result: any

      switch (query.type) {
        case 'sensor_data':
          result = await this.getSensorData(query, client)
          break
        case 'alerts':
          result = await this.getAlerts(query, client)
          break
        case 'farm_status':
          result = await this.getFarmStatus(query, client)
          break
        case 'system_health':
          result = await this.getSystemHealth(query, client)
          break
        default:
          result = { error: 'Unknown query type' }
      }

      socket.emit('query_response', {
        queryId: query.id,
        result
      })
    } catch (error) {
      logger.error('Dashboard query error:', error)
      socket.emit('query_error', {
        queryId: query.id,
        error: error instanceof Error ? error.message : 'Query failed'
      })
    }
  }

  private async handleDeviceCommand(socket: any, command: any): Promise<void> {
    try {
      const client = this.connectedClients.get(socket.id)
      if (!client || !client.permissions.includes('device_control')) {
        socket.emit('command_error', { error: 'Insufficient permissions' })
        return
      }

      // Forward command to appropriate service via MQTT
      const topic = `soilwise/commands/${command.deviceId}`
      await this.mqttService.publish(topic, JSON.stringify(command))

      socket.emit('command_sent', {
        commandId: command.id,
        deviceId: command.deviceId,
        timestamp: new Date()
      })

      logger.info(`Device command sent: ${command.type} to ${command.deviceId}`)
    } catch (error) {
      logger.error('Device command error:', error)
      socket.emit('command_error', {
        commandId: command.id,
        error: error instanceof Error ? error.message : 'Command failed'
      })
    }
  }

  private handleClientDisconnect(socket: any): void {
    const client = this.connectedClients.get(socket.id)
    if (client) {
      this.connectedClients.delete(socket.id)
      this.subscriptions.delete(socket.id)
      logger.info(`Dashboard client disconnected: ${socket.id}`)
    }
  }

  private setupDataStreams(): void {
    // Stream sensor data updates
    this.sensorManager.on('sensorData', (data) => {
      this.broadcastSensorUpdate(data)
    })

    // Stream MQTT messages
    this.mqttService.on('message', (topic, message) => {
      this.handleMQTTMessage(topic, message)
    })

    // Stream alerts
    this.on('alert_created', (alert) => {
      this.broadcastAlert(alert)
    })

    // Stream system status updates
    this.on('system_status', (status) => {
      this.broadcastSystemStatus(status)
    })
  }

  private broadcastSensorUpdate(sensorData: any): void {
    const update: RealTimeUpdate = {
      type: 'sensor_data',
      data: sensorData,
      timestamp: new Date(),
      sensorId: sensorData.sensorId,
      farmId: sensorData.farmId
    }

    // Broadcast to sensor-specific rooms
    this.io.to(`sensor_${sensorData.sensorId}`).emit('real_time_update', update)

    // Broadcast to farm-specific rooms if farmId is available
    if (sensorData.farmId) {
      this.io.to(`farm_${sensorData.farmId}`).emit('real_time_update', update)
    }
  }

  private broadcastAlert(alert: any): void {
    const update: RealTimeUpdate = {
      type: 'alert',
      data: alert,
      timestamp: new Date(),
      farmId: alert.farmId,
      sensorId: alert.sensorId
    }

    // Broadcast to relevant farm rooms
    if (alert.farmId) {
      this.io.to(`farm_${alert.farmId}`).emit('real_time_update', update)
    } else {
      // Broadcast to all connected clients
      this.io.emit('real_time_update', update)
    }
  }

  private broadcastSystemStatus(status: any): void {
    const update: RealTimeUpdate = {
      type: 'system_health',
      data: status,
      timestamp: new Date()
    }

    // Broadcast to all connected clients
    this.io.emit('real_time_update', update)
  }

  private handleMQTTMessage(topic: string, message: any): void {
    // Handle MQTT messages and forward to dashboard clients
    if (topic.startsWith('soilwise/alerts/')) {
      const alert = JSON.parse(message.toString())
      this.broadcastAlert(alert)
    } else if (topic.startsWith('soilwise/system/')) {
      const systemData = JSON.parse(message.toString())
      this.broadcastSystemStatus(systemData)
    }
  }

  private async getSensorData(query: any, client: DashboardClient): Promise<any> {
    // Check permissions
    if (!this.hasAccess(client, query.farmId)) {
      throw new Error('Access denied')
    }

    const limit = Math.min(query.limit || 100, 1000) // Cap at 1000 records
    const sensorId = query.sensorId
    
    return await this.database.getSensorData(sensorId, limit)
  }

  private async getAlerts(query: any, client: DashboardClient): Promise<any> {
    // Check permissions
    if (query.farmId && !this.hasAccess(client, query.farmId)) {
      throw new Error('Access denied')
    }

    const limit = Math.min(query.limit || 50, 500)
    return await this.database.getAlerts(limit)
  }

  private async getFarmStatus(query: any, client: DashboardClient): Promise<any> {
    // Check permissions
    if (!this.hasAccess(client, query.farmId)) {
      throw new Error('Access denied')
    }

    return {
      farmId: query.farmId,
      sensors: await this.getActiveSensors(query.farmId),
      alerts: await this.getActiveAlerts(query.farmId),
      lastUpdate: new Date()
    }
  }

  private async getSystemHealth(query: any, client: DashboardClient): Promise<any> {
    // Check permissions
    if (!client.permissions.includes('system_monitoring')) {
      throw new Error('Insufficient permissions')
    }

    return {
      services: {
        database: this.database.isConnected,
        mqtt: this.mqttService.isConnected,
        sensors: this.sensorManager.isActive
      },
      connectedClients: this.connectedClients.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    }
  }

  private hasAccess(client: DashboardClient, farmId: string): boolean {
    return client.farmIds.includes(farmId) || client.permissions.includes('admin')
  }

  private async getActiveSensors(farmId: string): Promise<any[]> {
    // Implementation would query sensors for specific farm
    return []
  }

  private async getActiveAlerts(farmId: string): Promise<any[]> {
    // Implementation would query active alerts for farm
    return []
  }

  private async validateAuthToken(token: string): Promise<boolean> {
    // Implementation would validate JWT token or API key
    // For now, accept any non-empty token
    return !!token && token.length > 0
  }

  private startHealthMonitoring(): void {
    // Send periodic health updates
    setInterval(() => {
      if (this.isRunning && this.connectedClients.size > 0) {
        const healthStatus = {
          services: {
            database: this.database.isConnected,
            mqtt: this.mqttService.isConnected,
            sensors: this.sensorManager.isActive
          },
          timestamp: new Date()
        }

        this.broadcastSystemStatus(healthStatus)
      }
    }, 30000) // Every 30 seconds
  }

  // Get current dashboard status
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      connectedClients: this.connectedClients.size,
      clients: Array.from(this.connectedClients.values()),
      subscriptions: Object.fromEntries(this.subscriptions)
    }
  }

  // Force disconnect client
  disconnectClient(clientId: string): void {
    const socket = this.io.sockets.sockets.get(clientId)
    if (socket) {
      socket.disconnect()
      logger.info(`Force disconnected client: ${clientId}`)
    }
  }

  // Broadcast message to specific farm
  broadcastToFarm(farmId: string, message: any): void {
    this.io.to(`farm_${farmId}`).emit('farm_broadcast', message)
  }

  // Broadcast message to all clients
  broadcastToAll(message: any): void {
    this.io.emit('global_broadcast', message)
  }
}
