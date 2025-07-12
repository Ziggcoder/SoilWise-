import { Express } from 'express'
import { LocalDatabase } from '../database/localDatabase'
import { SensorManager } from '../services/sensorManager'
import { AIService } from '../services/aiService'
import { VoiceService } from '../services/voiceService'
import { SyncService } from '../services/syncService'
import { logger } from '../utils/logger'

export interface Services {
  database: LocalDatabase
  sensorManager: SensorManager
  aiService: AIService
  voiceService: VoiceService
  syncService: SyncService
}

export function setupRoutes(app: Express, services: Services): void {
  const { database, sensorManager, aiService, voiceService, syncService } = services

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: database.isConnected,
        ai: aiService.connected,
        voice: voiceService.initialized,
        sync: syncService.running
      }
    })
  })

  // Sensor data endpoints
  app.get('/sensors', async (req, res) => {
    try {
      const { sensorId, limit = 100 } = req.query
      const data = await sensorManager.getSensorData(
        sensorId as string,
        parseInt(limit as string)
      )
      res.json({ success: true, data })
    } catch (error) {
      logger.error('Error getting sensor data:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get sensor data'
      })
    }
  })

  app.get('/sensors/:sensorId/latest', async (req, res) => {
    try {
      const { sensorId } = req.params
      const data = await sensorManager.getLatestSensorData(sensorId)
      res.json({ success: true, data })
    } catch (error) {
      logger.error('Error getting latest sensor data:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get latest sensor data'
      })
    }
  })

  // Alerts endpoints
  app.get('/alerts', async (req, res) => {
    try {
      const { limit = 100 } = req.query
      const alerts = await database.getAlerts(parseInt(limit as string))
      res.json({ success: true, data: alerts })
    } catch (error) {
      logger.error('Error getting alerts:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get alerts'
      })
    }
  })

  app.post('/alerts', async (req, res) => {
    try {
      const alertData = req.body
      const id = await database.insertAlert({
        ...alertData,
        timestamp: new Date(),
        resolved: false
      })
      res.json({ success: true, id })
    } catch (error) {
      logger.error('Error creating alert:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create alert'
      })
    }
  })

  // Farms endpoints
  app.get('/farms', async (req, res) => {
    try {
      const { ownerId } = req.query
      const farms = await database.getFarms(ownerId as string)
      res.json({ success: true, data: farms })
    } catch (error) {
      logger.error('Error getting farms:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get farms'
      })
    }
  })

  app.post('/farms', async (req, res) => {
    try {
      const farmData = req.body
      const id = await database.insertFarm({
        ...farmData,
        created: new Date()
      })
      res.json({ success: true, id })
    } catch (error) {
      logger.error('Error creating farm:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create farm'
      })
    }
  })

  // AI endpoints
  app.post('/ai/advisory', async (req, res) => {
    try {
      const { sensorData, farmData } = req.body
      const response = await aiService.getAdvisory(sensorData, farmData)
      res.json(response)
    } catch (error) {
      logger.error('Error getting AI advisory:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get AI advisory'
      })
    }
  })

  app.post('/ai/prediction', async (req, res) => {
    try {
      const { sensorData, predictionType } = req.body
      const response = await aiService.getPrediction(sensorData, predictionType)
      res.json(response)
    } catch (error) {
      logger.error('Error getting AI prediction:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get AI prediction'
      })
    }
  })

  app.post('/ai/analyze', async (req, res) => {
    try {
      const { data, analysisType } = req.body
      const response = await aiService.analyzeData(data, analysisType)
      res.json(response)
    } catch (error) {
      logger.error('Error analyzing data:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to analyze data'
      })
    }
  })

  app.post('/ai/crop-recommendations', async (req, res) => {
    try {
      const { soilData, weatherData } = req.body
      const response = await aiService.getCropRecommendations(soilData, weatherData)
      res.json(response)
    } catch (error) {
      logger.error('Error getting crop recommendations:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get crop recommendations'
      })
    }
  })

  // Voice endpoints
  app.post('/voice/query', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }
      
      // TODO: Implement voice query processing
      res.json({ 
        message: 'Voice query received', 
        query,
        response: 'Voice processing not yet implemented' 
      });
    } catch (error) {
      logger.error('Voice query error:', error);
      res.status(500).json({ error: 'Voice query processing failed' });
    }
  });

  app.get('/voice/status', (req, res) => {
    res.json({
      success: true,
      data: {
        initialized: voiceService.initialized,
        listening: voiceService.listening
      }
    })
  })

  app.post('/voice/start-listening', async (req, res) => {
    try {
      await voiceService.startListening()
      res.json({ success: true, message: 'Voice listening started' })
    } catch (error) {
      logger.error('Error starting voice listening:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to start voice listening'
      })
    }
  })

  app.post('/voice/stop-listening', async (req, res) => {
    try {
      await voiceService.stopListening()
      res.json({ success: true, message: 'Voice listening stopped' })
    } catch (error) {
      logger.error('Error stopping voice listening:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to stop voice listening'
      })
    }
  })

  // Sync endpoints
  app.get('/sync/status', (req, res) => {
    const status = syncService.getSyncStatus()
    res.json({ success: true, data: status })
  })

  app.post('/sync/force', async (req, res) => {
    try {
      await syncService.forceSyncNow()
      res.json({ success: true, message: 'Sync completed' })
    } catch (error) {
      logger.error('Error forcing sync:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to force sync'
      })
    }
  })

  app.post('/sync/config', async (req, res) => {
    try {
      const config = req.body
      await syncService.updateSyncConfig(config)
      res.json({ success: true, message: 'Sync configuration updated' })
    } catch (error) {
      logger.error('Error updating sync config:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update sync configuration'
      })
    }
  })

  // Configuration endpoints
  app.get('/config/:key', async (req, res) => {
    try {
      const { key } = req.params
      const value = await database.getConfiguration(key)
      res.json({ success: true, data: value })
    } catch (error) {
      logger.error('Error getting configuration:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration'
      })
    }
  })

  app.post('/config', async (req, res) => {
    try {
      const configurations = req.body
      await database.updateConfigurations(configurations)
      res.json({ success: true, message: 'Configurations updated' })
    } catch (error) {
      logger.error('Error updating configurations:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update configurations'
      })
    }
  })

  // System endpoints
  app.get('/system/info', (req, res) => {
    res.json({
      success: true,
      data: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid
      }
    })
  })

  app.post('/system/restart', (req, res) => {
    logger.info('System restart requested')
    res.json({ success: true, message: 'System restart initiated' })
    
    // Graceful shutdown and restart
    setTimeout(() => {
      process.exit(0)
    }, 1000)
  })

  logger.info('API routes setup complete')
}
