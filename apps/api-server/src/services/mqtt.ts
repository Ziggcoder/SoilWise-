import mqtt from 'mqtt'
import { logger } from '../utils/logger'

class MQTTService {
  private client: mqtt.MqttClient | null = null
  private readonly brokerUrl: string
  private readonly topics: string[]

  constructor() {
    this.brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
    this.topics = [
      'sensors/+/readings',
      'sensors/+/status',
      'alerts/+',
      'system/health'
    ]
  }

  async connect(): Promise<void> {
    try {
      this.client = mqtt.connect(this.brokerUrl, {
        clientId: `soilwise-api-${Date.now()}`,
        clean: true,
        connectTimeout: 30000,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD
      })

      this.client.on('connect', () => {
        logger.info('MQTT client connected to broker', { brokerUrl: this.brokerUrl })
        this.subscribeToTopics()
      })

      this.client.on('error', (error) => {
        logger.error('MQTT client error:', error)
      })

      this.client.on('offline', () => {
        logger.warn('MQTT client offline')
      })

      this.client.on('reconnect', () => {
        logger.info('MQTT client reconnecting')
      })

      this.client.on('message', (topic, payload) => {
        this.handleMessage(topic, payload)
      })
    } catch (error) {
      logger.error('Failed to connect to MQTT broker:', error)
      throw error
    }
  }

  private subscribeToTopics(): void {
    if (!this.client) return

    this.topics.forEach(topic => {
      this.client!.subscribe(topic, (error) => {
        if (error) {
          logger.error('Failed to subscribe to topic:', { topic, error })
        } else {
          logger.info('Subscribed to topic:', { topic })
        }
      })
    })
  }

  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = JSON.parse(payload.toString())
      logger.debug('Received MQTT message:', { topic, message })

      // TODO: Process different message types
      if (topic.startsWith('sensors/')) {
        this.handleSensorMessage(topic, message)
      } else if (topic.startsWith('alerts/')) {
        this.handleAlertMessage(topic, message)
      } else if (topic.startsWith('system/')) {
        this.handleSystemMessage(topic, message)
      }
    } catch (error) {
      logger.error('Failed to process MQTT message:', { topic, error })
    }
  }

  private handleSensorMessage(topic: string, message: any): void {
    // TODO: Implement sensor message processing
    logger.info('Processing sensor message:', { topic, sensorId: message.sensorId })
  }

  private handleAlertMessage(topic: string, message: any): void {
    // TODO: Implement alert message processing
    logger.info('Processing alert message:', { topic, alertType: message.type })
  }

  private handleSystemMessage(topic: string, message: any): void {
    // TODO: Implement system message processing
    logger.info('Processing system message:', { topic, status: message.status })
  }

  async publish(topic: string, payload: any): Promise<void> {
    if (!this.client) {
      throw new Error('MQTT client not connected')
    }

    try {
      const message = JSON.stringify(payload)
      this.client.publish(topic, message, (error) => {
        if (error) {
          logger.error('Failed to publish message:', { topic, error })
        } else {
          logger.debug('Published message:', { topic, payload })
        }
      })
    } catch (error) {
      logger.error('Failed to publish MQTT message:', { topic, error })
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.end()
      this.client = null
      logger.info('MQTT client disconnected')
    }
  }
}

export const mqttService = new MQTTService()
