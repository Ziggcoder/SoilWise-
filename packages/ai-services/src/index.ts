// AI Services Main Entry Point
import { logger } from './utils/logger'
import { AIAdvisoryEngine } from './advisory/advisoryEngine'

class AIServices {
  private advisoryEngine: AIAdvisoryEngine

  constructor() {
    this.advisoryEngine = new AIAdvisoryEngine()
    logger.info('AI Services initialized')
  }

  async start() {
    try {
      // Initialize advisory engine
      await this.advisoryEngine.initialize()
      logger.info('Advisory engine started')

      // TODO: Initialize other AI services
      // - Document processing
      // - Vector database
      // - LLM integration

      logger.info('AI Services started successfully on development mode')
    } catch (error) {
      logger.error('Failed to start AI Services:', error)
      throw error
    }
  }

  async stop() {
    try {
      // Cleanup resources
      logger.info('AI Services stopped')
    } catch (error) {
      logger.error('Error stopping AI Services:', error)
    }
  }
}

// Start services if this is the main module
if (require.main === module) {
  const aiServices = new AIServices()
  
  aiServices.start().catch((error) => {
    logger.error('Failed to start AI Services:', error)
    process.exit(1)
  })

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully')
    await aiServices.stop()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully')
    await aiServices.stop()
    process.exit(0)
  })
}

export { AIServices }
