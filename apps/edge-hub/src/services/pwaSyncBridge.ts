import { EventEmitter } from 'events'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'
import { MQTTService } from './mqttService'

export interface PWASyncData {
  farms: any[]
  fields: any[]
  observations: any[]
  sensorReadings: any[]
  tasks: any[]
  photos: any[]
  notes: any[]
}

export interface SyncRequest {
  type: 'full' | 'incremental'
  lastSync?: Date
  deviceId: string
  userId: string
}

export interface SyncResponse {
  success: boolean
  data?: PWASyncData
  conflicts?: any[]
  error?: string
  timestamp: Date
}

export class PWASyncBridge extends EventEmitter {
  private database: LocalDatabase
  private mqttService: MQTTService
  private isRunning = false
  private syncInterval: NodeJS.Timeout | null = null
  private connectedDevices: Map<string, any> = new Map()

  constructor(database: LocalDatabase, mqttService: MQTTService) {
    super()
    this.database = database
    this.mqttService = mqttService
  }

  async start(): Promise<void> {
    try {
      this.isRunning = true
      this.setupMQTTHandlers()
      this.startPeriodicSync()
      
      logger.info('PWA Sync Bridge started')
    } catch (error) {
      logger.error('Failed to start PWA Sync Bridge:', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    this.connectedDevices.clear()
    logger.info('PWA Sync Bridge stopped')
  }

  private setupMQTTHandlers(): void {
    // Listen for PWA sync requests
    this.mqttService.on('message', async (topic: string, message: any) => {
      if (topic.startsWith('soilwise/pwa/sync/request')) {
        await this.handleSyncRequest(topic, message)
      } else if (topic.startsWith('soilwise/pwa/device/connect')) {
        await this.handleDeviceConnect(topic, message)
      } else if (topic.startsWith('soilwise/pwa/device/disconnect')) {
        await this.handleDeviceDisconnect(topic, message)
      }
    })
  }

  private async handleSyncRequest(topic: string, message: any): Promise<void> {
    try {
      const request: SyncRequest = JSON.parse(message.toString())
      const response = await this.processSyncRequest(request)
      
      // Send response back to PWA device
      const responseTopic = `soilwise/pwa/sync/response/${request.deviceId}`
      await this.mqttService.publish(responseTopic, JSON.stringify(response))
      
      logger.info(`Sync request processed for device ${request.deviceId}`)
    } catch (error) {
      logger.error('Error handling sync request:', error)
    }
  }

  private async processSyncRequest(request: SyncRequest): Promise<SyncResponse> {
    try {
      if (request.type === 'full') {
        return await this.processFullSync(request)
      } else {
        return await this.processIncrementalSync(request)
      }
    } catch (error) {
      logger.error('Sync request processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  private async processFullSync(request: SyncRequest): Promise<SyncResponse> {
    const data: PWASyncData = {
      farms: await this.database.getFarms(),
      fields: await this.database.getFields(),
      observations: [], // Would implement observation queries
      sensorReadings: await this.database.getSensorData('', 1000),
      tasks: [], // Would implement task queries
      photos: [], // Would implement photo queries
      notes: [] // Would implement note queries
    }

    return {
      success: true,
      data,
      timestamp: new Date()
    }
  }

  private async processIncrementalSync(request: SyncRequest): Promise<SyncResponse> {
    if (!request.lastSync) {
      return this.processFullSync(request)
    }

    // Get only data modified since last sync
    const data: PWASyncData = {
      farms: await this.database.getFarmsModifiedSince(request.lastSync),
      fields: await this.database.getFieldsModifiedSince(request.lastSync),
      observations: [], // Would implement incremental observation queries
      sensorReadings: await this.database.getSensorDataSince(request.lastSync),
      tasks: [],
      photos: [],
      notes: []
    }

    return {
      success: true,
      data,
      timestamp: new Date()
    }
  }

  private async handleDeviceConnect(topic: string, message: any): Promise<void> {
    try {
      const deviceInfo = JSON.parse(message.toString())
      this.connectedDevices.set(deviceInfo.deviceId, {
        ...deviceInfo,
        connectedAt: new Date(),
        lastSeen: new Date()
      })

      logger.info(`PWA device connected: ${deviceInfo.deviceId}`)
      this.emit('device_connected', deviceInfo)
    } catch (error) {
      logger.error('Error handling device connect:', error)
    }
  }

  private async handleDeviceDisconnect(topic: string, message: any): Promise<void> {
    try {
      const { deviceId } = JSON.parse(message.toString())
      this.connectedDevices.delete(deviceId)

      logger.info(`PWA device disconnected: ${deviceId}`)
      this.emit('device_disconnected', { deviceId })
    } catch (error) {
      logger.error('Error handling device disconnect:', error)
    }
  }

  private startPeriodicSync(): void {
    // Check for connected devices and sync data every 5 minutes
    this.syncInterval = setInterval(async () => {
      if (this.connectedDevices.size > 0) {
        await this.broadcastUpdates()
      }
    }, 5 * 60 * 1000)
  }

  private async broadcastUpdates(): Promise<void> {
    try {
      // Get recent sensor data to broadcast
      const recentData = await this.database.getSensorDataSince(
        new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      )

      if (recentData.length > 0) {
        const updateMessage = {
          type: 'sensor_update',
          data: recentData,
          timestamp: new Date()
        }

        // Broadcast to all connected PWA devices
        for (const deviceId of this.connectedDevices.keys()) {
          const topic = `soilwise/pwa/updates/${deviceId}`
          await this.mqttService.publish(topic, JSON.stringify(updateMessage))
        }

        logger.debug(`Broadcasted updates to ${this.connectedDevices.size} devices`)
      }
    } catch (error) {
      logger.error('Error broadcasting updates:', error)
    }
  }

  // Method for PWA to push data to edge hub
  async receiveDataFromPWA(deviceId: string, data: any): Promise<void> {
    try {
      // Process incoming data from PWA
      if (data.fields) {
        await this.processPWAFields(data.fields)
      }
      
      if (data.observations) {
        await this.processPWAObservations(data.observations)
      }
      
      if (data.photos) {
        await this.processPWAPhotos(data.photos)
      }
      
      if (data.tasks) {
        await this.processPWATasks(data.tasks)
      }

      logger.info(`Processed data from PWA device ${deviceId}`)
      this.emit('pwa_data_received', { deviceId, data })
    } catch (error) {
      logger.error('Error processing PWA data:', error)
      throw error
    }
  }

  private async processPWAFields(fields: any[]): Promise<void> {
    for (const field of fields) {
      try {
        // Check if field exists
        const existing = await this.database.getFieldById(field.id)
        
        if (existing) {
          // Update existing field
          await this.database.updateField(field.id, field)
        } else {
          // Insert new field
          await this.database.insertField(field)
        }
      } catch (error) {
        logger.error(`Error processing field ${field.id}:`, error)
      }
    }
  }

  private async processPWAObservations(observations: any[]): Promise<void> {
    for (const observation of observations) {
      try {
        await this.database.insertObservation(observation)
      } catch (error) {
        logger.error(`Error processing observation ${observation.id}:`, error)
      }
    }
  }

  private async processPWAPhotos(photos: any[]): Promise<void> {
    for (const photo of photos) {
      try {
        // Store photo data and metadata
        await this.database.insertPhoto(photo)
        
        // Emit event for photo processing (analysis, storage, etc.)
        this.emit('photo_received', photo)
      } catch (error) {
        logger.error(`Error processing photo ${photo.id}:`, error)
      }
    }
  }

  private async processPWATasks(tasks: any[]): Promise<void> {
    for (const task of tasks) {
      try {
        await this.database.insertTask(task)
      } catch (error) {
        logger.error(`Error processing task ${task.id}:`, error)
      }
    }
  }

  // Get sync status for monitoring
  getSyncStatus(): any {
    return {
      isRunning: this.isRunning,
      connectedDevices: this.connectedDevices.size,
      devices: Array.from(this.connectedDevices.values()),
      lastBroadcast: this.syncInterval ? new Date() : null
    }
  }

  // Force sync for specific device
  async forceSyncDevice(deviceId: string): Promise<void> {
    const device = this.connectedDevices.get(deviceId)
    if (!device) {
      throw new Error(`Device ${deviceId} not connected`)
    }

    const syncRequest: SyncRequest = {
      type: 'full',
      deviceId,
      userId: device.userId
    }

    const response = await this.processSyncRequest(syncRequest)
    const topic = `soilwise/pwa/sync/forced/${deviceId}`
    
    await this.mqttService.publish(topic, JSON.stringify(response))
    logger.info(`Forced sync initiated for device ${deviceId}`)
  }
}
