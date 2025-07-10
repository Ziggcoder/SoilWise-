import mqtt from 'mqtt'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'
import { SensorData } from './sensorManager'

export class MQTTService {
  private client: mqtt.MqttClient | null = null
  private database: LocalDatabase
  private isConnected = false
  private reconnectInterval: NodeJS.Timeout | null = null

  constructor(database: LocalDatabase) {
    this.database = database
  }

  async connect(): Promise<void> {
    try {
      const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
      const options: mqtt.IClientOptions = {
        clientId: `edge-hub-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        reconnectPeriod: 1000,
      }

      this.client = mqtt.connect(brokerUrl, options)

      this.client.on('connect', () => {
        this.isConnected = true
        logger.info('Connected to MQTT broker')
        this.subscribeToTopics()
      })

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message)
      })

      this.client.on('error', (error) => {
        logger.error('MQTT connection error:', error)
        this.isConnected = false
      })

      this.client.on('close', () => {
        this.isConnected = false
        logger.warn('MQTT connection closed')
      })

      this.client.on('offline', () => {
        this.isConnected = false
        logger.warn('MQTT client offline')
      })

    } catch (error) {
      logger.error('Failed to connect to MQTT broker:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval)
    }

    if (this.client) {
      await new Promise<void>((resolve) => {
        this.client!.end(false, {}, () => {
          this.isConnected = false
          logger.info('Disconnected from MQTT broker')
          resolve()
        })
      })
    }
  }

  private subscribeToTopics(): void {
    if (!this.client) return

    const topics = [
      'sensors/+/data',
      'sensors/+/config',
      'commands/+',
      'alerts/+',
      'sync/+',
    ]

    topics.forEach(topic => {
      this.client!.subscribe(topic, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to topic ${topic}:`, err)
        } else {
          logger.info(`Subscribed to topic: ${topic}`)
        }
      })
    })
  }

  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      const messageStr = message.toString()
      logger.debug(`Received message on ${topic}: ${messageStr}`)

      if (topic.startsWith('sensors/') && topic.endsWith('/data')) {
        await this.handleSensorData(topic, messageStr)
      } else if (topic.startsWith('commands/')) {
        await this.handleCommand(topic, messageStr)
      } else if (topic.startsWith('alerts/')) {
        await this.handleAlert(topic, messageStr)
      } else if (topic.startsWith('sync/')) {
        await this.handleSync(topic, messageStr)
      }
    } catch (error) {
      logger.error(`Error handling message on ${topic}:`, error)
    }
  }

  private async handleSensorData(topic: string, messageStr: string): Promise<void> {
    try {
      const sensorData: SensorData = JSON.parse(messageStr)
      await this.database.insertSensorData(sensorData)
      logger.debug(`Stored sensor data from MQTT: ${sensorData.sensorId}`)
    } catch (error) {
      logger.error('Error handling sensor data:', error)
    }
  }

  private async handleCommand(topic: string, messageStr: string): Promise<void> {
    try {
      const command = JSON.parse(messageStr)
      logger.info(`Received command: ${command.type}`)
      
      // Handle different command types
      switch (command.type) {
        case 'calibrate_sensor':
          await this.calibrateSensor(command.sensorId, command.params)
          break
        case 'update_config':
          await this.updateConfig(command.config)
          break
        case 'restart_service':
          await this.restartService(command.service)
          break
        default:
          logger.warn(`Unknown command type: ${command.type}`)
      }
    } catch (error) {
      logger.error('Error handling command:', error)
    }
  }

  private async handleAlert(topic: string, messageStr: string): Promise<void> {
    try {
      const alert = JSON.parse(messageStr)
      await this.database.insertAlert(alert)
      logger.info(`Stored alert: ${alert.type} - ${alert.message}`)
    } catch (error) {
      logger.error('Error handling alert:', error)
    }
  }

  private async handleSync(topic: string, messageStr: string): Promise<void> {
    try {
      const syncData = JSON.parse(messageStr)
      logger.info(`Received sync request: ${syncData.type}`)
      
      // Handle sync operations
      switch (syncData.type) {
        case 'full_sync':
          await this.performFullSync()
          break
        case 'incremental_sync':
          await this.performIncrementalSync(syncData.timestamp)
          break
        default:
          logger.warn(`Unknown sync type: ${syncData.type}`)
      }
    } catch (error) {
      logger.error('Error handling sync:', error)
    }
  }

  async publishSensorData(sensorData: SensorData): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Cannot publish sensor data: MQTT not connected')
      return
    }

    try {
      const topic = `sensors/${sensorData.sensorId}/data`
      const message = JSON.stringify(sensorData)
      
      await new Promise<void>((resolve, reject) => {
        this.client!.publish(topic, message, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      logger.debug(`Published sensor data: ${sensorData.sensorId}`)
    } catch (error) {
      logger.error('Error publishing sensor data:', error)
    }
  }

  async publishAlert(alert: any): Promise<void> {
    if (!this.client || !this.isConnected) {
      logger.warn('Cannot publish alert: MQTT not connected')
      return
    }

    try {
      const topic = `alerts/${alert.type}`
      const message = JSON.stringify(alert)
      
      await new Promise<void>((resolve, reject) => {
        this.client!.publish(topic, message, (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      logger.info(`Published alert: ${alert.type}`)
    } catch (error) {
      logger.error('Error publishing alert:', error)
    }
  }

  private async calibrateSensor(sensorId: string, params: any): Promise<void> {
    logger.info(`Calibrating sensor ${sensorId} with params:`, params)
    // Implement sensor calibration logic
  }

  private async updateConfig(config: any): Promise<void> {
    logger.info('Updating configuration:', config)
    // Implement configuration update logic
  }

  private async restartService(serviceName: string): Promise<void> {
    logger.info(`Restarting service: ${serviceName}`)
    // Implement service restart logic
  }

  private async performFullSync(): Promise<void> {
    logger.info('Performing full sync')
    // Implement full sync logic
  }

  private async performIncrementalSync(timestamp: string): Promise<void> {
    logger.info(`Performing incremental sync from ${timestamp}`)
    // Implement incremental sync logic
  }

  get connected(): boolean {
    return this.isConnected
  }
}
