// Voice Assistant Main Entry Point
import { logger } from './utils/logger'
import { VoiceAssistant } from './voiceAssistant'

class VoiceAssistantService {
  private voiceAssistant: VoiceAssistant

  constructor() {
    // Default configuration for development
    const config = {
      sttModel: process.env.WHISPER_MODEL_PATH || './models/whisper',
      ttsModel: process.env.COQUI_MODEL_PATH || './models/coqui',
      language: 'en',
      maxRecordingTime: 30000, // 30 seconds
      silenceThreshold: 0.01,
      enableWakeWord: false,
      wakeWord: 'soilwise',
      sampleRate: 16000, // Added value: audio sample rate in Hz
      logLevel: 'info'   // Added value: logging level
    }
    
    this.voiceAssistant = new VoiceAssistant(config)
    logger.info('Voice Assistant Service initialized')
  }

  async start() {
    try {
      // Initialize voice assistant
      await this.voiceAssistant.initialize()
      logger.info('Voice Assistant started')

      // TODO: Start voice processing pipeline
      // - Audio input/output
      // - Speech recognition (Whisper)
      // - Text to speech (Coqui TTS)
      // - LLM integration (Ollama)

      logger.info('Voice Assistant Service started successfully on development mode')
    } catch (error) {
      logger.error('Failed to start Voice Assistant Service:', error)
      throw error
    }
  }

  async stop() {
    try {
      // Cleanup resources
      await this.voiceAssistant.cleanup()
      logger.info('Voice Assistant Service stopped')
    } catch (error) {
      logger.error('Error stopping Voice Assistant Service:', error)
    }
  }
}

// Start services if this is the main module
if (require.main === module) {
  const voiceService = new VoiceAssistantService()
  
  voiceService.start().catch((error) => {
    logger.error('Failed to start Voice Assistant Service:', error)
    process.exit(1)
  })

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully')
    await voiceService.stop()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully')
    await voiceService.stop()
    process.exit(0)
  })
}

export { VoiceAssistantService }
