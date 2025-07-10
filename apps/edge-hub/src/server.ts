import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { logger } from './utils/logger'
import { SensorManager } from './services/sensorManager'
import { MQTTService } from './services/mqttService'
import { AIService } from './services/aiService'
import { VoiceService } from './services/voiceService'
import { SyncService } from './services/syncService'
import { LocalDatabase } from './database/localDatabase'
import { setupRoutes } from './routes'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Services
const database = new LocalDatabase()
const sensorManager = new SensorManager(database)
const mqttService = new MQTTService(database)
const aiService = new AIService()
const voiceService = new VoiceService(aiService)
const syncService = new SyncService(database)

// Routes
setupRoutes(app, { database, sensorManager, aiService, voiceService, syncService })

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: database.isConnected,
      mqtt: mqttService.isConnected,
      ai: aiService.isReady,
      voice: voiceService.isReady,
      sync: syncService.isOnline
    }
  })
})

// WebSocket connections
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  socket.on('subscribe_sensor', (sensorId: string) => {
    socket.join(`sensor_${sensorId}`)
    logger.info(`Client ${socket.id} subscribed to sensor ${sensorId}`)
  })

  socket.on('voice_input', async (audioData: Buffer) => {
    try {
      const response = await voiceService.processVoiceInput(audioData)
      socket.emit('voice_response', response)
    } catch (error) {
      logger.error('Voice processing error:', error)
      socket.emit('voice_error', { error: 'Failed to process voice input' })
    }
  })

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Initialize services
async function startEdgeHub() {
  try {
    // Initialize database
    await database.initialize()
    logger.info('Local database initialized')

    // Initialize sensor manager
    await sensorManager.initialize()
    logger.info('Sensor manager initialized')

    // Start MQTT service
    await mqttService.connect()
    logger.info('MQTT service connected')

    // Initialize AI service
    await aiService.initialize()
    logger.info('AI service initialized')

    // Initialize voice service
    await voiceService.initialize()
    logger.info('Voice service initialized')

    // Start sync service
    await syncService.start()
    logger.info('Sync service started')

    // Setup sensor data broadcasting
    sensorManager.on('sensorData', (data) => {
      io.to(`sensor_${data.sensorId}`).emit('sensor_update', data)
      mqttService.publish(`sensor/${data.sensorId}/data`, data)
    })

    // Setup MQTT message handling
    mqttService.on('message', (topic, message) => {
      if (topic.startsWith('sensor/')) {
        const sensorId = topic.split('/')[1]
        io.to(`sensor_${sensorId}`).emit('sensor_update', message)
      }
    })

    // Start server
    server.listen(PORT, () => {
      logger.info(`Edge Hub running on port ${PORT}`)
      logger.info(`Platform: ${process.platform}`)
      logger.info(`Architecture: ${process.arch}`)
    })

  } catch (error) {
    logger.error('Failed to start Edge Hub:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await cleanupServices()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await cleanupServices()
  process.exit(0)
})

async function cleanupServices() {
  try {
    await syncService.stop()
    await voiceService.cleanup()
    await aiService.cleanup()
    await mqttService.disconnect()
    await sensorManager.cleanup()
    await database.close()
    server.close()
    logger.info('All services cleaned up')
  } catch (error) {
    logger.error('Error during cleanup:', error)
  }
}

startEdgeHub()

export { app, server, io }
