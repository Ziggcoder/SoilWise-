import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { Server } from 'socket.io'
import { createServer } from 'http'
import dotenv from 'dotenv'

import { mqttService } from './services/mqtt'
import { authRoutes } from './routes/auth'
import { sensorRoutes } from './routes/sensors'
import { farmRoutes } from './routes/farms'
import { alertRoutes } from './routes/alerts'
import { syncRoutes } from './routes/sync'
import { aiRoutes } from './routes/ai'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './utils/logger'
import { initializeDatabase } from './database'
import { setupSocketIO } from './services/socket'
import { startCronJobs } from './services/cron'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 9171

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/sensors', sensorRoutes)
app.use('/api/farms', farmRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/sync', syncRoutes)
app.use('/api/ai', aiRoutes)

// Error handling
app.use(errorHandler)

// Initialize services
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase()
    logger.info('Database initialized')

    // Setup Socket.IO
    setupSocketIO(io)
    logger.info('Socket.IO configured')

    // Start MQTT service
    await mqttService.connect()
    // logger.info('MQTT service connected')

    // Start cron jobs
    // startCronJobs()
    // logger.info('Cron jobs started')

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

startServer()

export { app, server, io }
