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
import { CameraService } from './services/cameraService'
import { PWASyncBridge } from './services/pwaSyncBridge'
import { DashboardBridge } from './services/dashboardBridge'
import { CloudBridge } from './services/cloudBridge'
import { SystemMonitor } from './services/systemMonitor'
import { DataSimulator } from './services/dataSimulator'
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

// Initialize core services
const database = new LocalDatabase()
const sensorManager = new SensorManager(database)
const mqttService = new MQTTService(database)
const aiService = new AIService()
const voiceService = new VoiceService(aiService)
const syncService = new SyncService(database)

// Initialize integration services
const cameraService = new CameraService()
const pwaSyncBridge = new PWASyncBridge(database, mqttService)
const dashboardBridge = new DashboardBridge(io, database, mqttService, sensorManager)
const cloudBridge = new CloudBridge(database)
const systemMonitor = new SystemMonitor(database)
const dataSimulator = new DataSimulator()

// Routes
setupRoutes(app, { 
  database, 
  sensorManager, 
  aiService, 
  voiceService, 
  syncService
})

// Health check endpoint
app.get('/health', (req, res) => {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: database ? 'connected' : 'disconnected',
      mqtt: 'connected', // TODO: Add actual MQTT status check
      websocket: io ? 'active' : 'inactive',
      simulator: dataSimulator ? 'running' : 'stopped'
    },
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version
    }
  };
  
  res.json(status);
});

// Status endpoint with detailed information
app.get('/status', async (req, res) => {
  try {
    const systemInfo = await systemMonitor.getSystemInfo();
    const status = {
      ...systemInfo,
      services: {
        database: database ? 'connected' : 'disconnected',
        mqtt: 'connected', // TODO: Add actual MQTT status check
        websocket: io ? 'active' : 'inactive',
        simulator: dataSimulator ? 'running' : 'stopped',
        pwaBridge: 'active',
        dashboardBridge: 'active',
        cloudBridge: 'active'
      },
      metrics: {
        totalSensorReadings: 0, // TODO: Get from database
        activeFarms: 3,
        connectedDevices: 4,
        alertsCount: 0
      }
    };
    
    res.json(status);
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to get system status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

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

// Service startup logic
async function startServices(): Promise<void> {
  try {
    logger.info('Starting SoilWise Edge Hub services...')
    
    // Initialize database first
    await database.initialize()
    logger.info('Database initialized')

    // Start core services
    await sensorManager.start()
    logger.info('Sensor Manager started')

    await mqttService.connect()
    logger.info('MQTT Service connected')

    await aiService.initialize()
    logger.info('AI Service initialized')

    await voiceService.initialize()
    logger.info('Voice Service initialized')

    await syncService.start()
    logger.info('Sync Service started')

    // Start integration services
    // Note: Camera service will be initialized when needed
    logger.info('Camera Service ready')

    await pwaSyncBridge.start()
    logger.info('PWA Sync Bridge started')

    await dashboardBridge.start()
    logger.info('Dashboard Bridge started')

    await cloudBridge.start()
    logger.info('Cloud Bridge started')

    await systemMonitor.start()
    logger.info('System Monitor started')

    // Start data simulator for development/testing
    if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SIMULATOR === 'true') {
      dataSimulator.start()
      logger.info('Data Simulator started')
    }

    // Set up service event handlers
    setupServiceEventHandlers()

    logger.info('All services started successfully')
  } catch (error) {
    logger.error('Failed to start services:', error)
    process.exit(1)
  }
}

function setupServiceEventHandlers(): void {
  // Forward sensor data to real-time clients
  sensorManager.on('data', (data) => {
    io.emit('sensor_data', data)
  })

  // Forward alerts to dashboard
  systemMonitor.on('alert', (alert) => {
    io.emit('system_alert', alert)
  })

  // Forward camera captures
  cameraService.on('photo_captured', (photo) => {
    io.emit('camera_update', photo)
  })

  // Forward simulated sensor data
  dataSimulator.on('sensor_data', async (data) => {
    // Store in database
    await database.insertSensorData(data)
    
    // Forward to real-time clients
    io.emit('sensor_data', data)
    
    // Publish to MQTT for PWA
    mqttService.publish(`sensors/${data.farm_id}/${data.sensor_id}/data`, data)
  })

  // Forward simulated alerts
  dataSimulator.on('alert', async (alert) => {
    // Store in database
    await database.insertAlert(alert)
    
    // Forward to dashboard
    io.emit('system_alert', alert)
    
    // Publish to MQTT
    mqttService.publish(`alerts/${alert.farm_id}`, alert)
  })

  // Forward device status updates
  dataSimulator.on('device_status', (status) => {
    io.emit('device_status', status)
    mqttService.publish(`devices/${status.device_id}/status`, status)
  })

  logger.info('Service event handlers configured')
}

async function stopServices(): Promise<void> {
  logger.info('Stopping services...')
  
  try {
    dataSimulator.stop()
    await systemMonitor.stop()
    await cloudBridge.stop()
    await dashboardBridge.stop()
    await pwaSyncBridge.stop()
    // Camera service cleanup handled automatically
    await syncService.stop()
    await voiceService.cleanup()
    await aiService.cleanup()
    await mqttService.disconnect()
    await sensorManager.stop()
    await database.close()
    
    logger.info('All services stopped')
  } catch (error) {
    logger.error('Error stopping services:', error)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  await stopServices()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully')
  await stopServices()
  process.exit(0)
})

// Start the server
async function startServer(): Promise<void> {
  try {
    // Start all services first
    await startServices()
    
    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`SoilWise Edge Hub server running on port ${PORT}`)
      logger.info('🌱 Edge Hub is ready to serve!')
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Initialize and start the server
startServer().catch((error) => {
  logger.error('Startup error:', error)
  process.exit(1)
})
