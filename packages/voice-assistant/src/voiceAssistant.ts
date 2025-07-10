import { logger } from './utils/logger'
import { WhisperSTT } from './stt/whisperSTT'
import { CoquiTTS } from './tts/coquiTTS'
import { IntentClassifier } from './nlp/intentClassifier'
import { ContextManager } from './nlp/contextManager'
import { AudioProcessor, AudioConfig } from './audio/audioProcessor'

export interface VoiceConfig {
  sttModel: string
  ttsModel: string
  language: string
  maxRecordingTime: number
  silenceThreshold: number
  enableWakeWord: boolean
  wakeWord: string
  sampleRate: number
  logLevel: string
}

export class VoiceAssistant {
  private config: VoiceConfig
  private stt: WhisperSTT
  private tts: CoquiTTS
  private intentClassifier: IntentClassifier
  private contextManager: ContextManager
  private audioProcessor: AudioProcessor
  private isInitialized: boolean = false

  constructor(config: VoiceConfig) {
    this.config = config
    this.stt = new WhisperSTT(config.sttModel)
    this.tts = new CoquiTTS(config.ttsModel)
    this.intentClassifier = new IntentClassifier()
    this.contextManager = new ContextManager()
    this.audioProcessor = new AudioProcessor({
      sampleRate: config.sampleRate,
      channels: 1,
      bitDepth: 16
    })
    
    logger.info('VoiceAssistant initialized with config:', {
      language: config.language,
      wakeWord: config.wakeWord,
      enableWakeWord: config.enableWakeWord
    })
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Voice Assistant components...')
      
      // Initialize components
      await this.stt.initialize()
      await this.tts.initialize()
      await this.intentClassifier.initialize()
      await this.contextManager.initialize()
      await this.audioProcessor.initialize()
      
      this.isInitialized = true
      logger.info('Voice Assistant initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize Voice Assistant:', error)
      throw error
    }
  }

  async processVoiceInput(audioBuffer: Buffer, sessionId: string = 'default'): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Voice Assistant not initialized')
    }

    try {
      // Process audio
      const processedAudio = await this.audioProcessor.processAudio(audioBuffer)
      
      // Speech to text
      const transcription = await this.stt.transcribe(processedAudio)
      logger.info('Transcription:', transcription)
      
      // Intent classification
      const intent = await this.intentClassifier.classifyIntent(transcription)
      logger.info('Intent classified:', intent)
      
      // Context management
      let context = this.contextManager.getContext(sessionId)
      if (!context) {
        context = this.contextManager.createContext(sessionId, 'user')
      }
      
      const response = await this.contextManager.processRequest(transcription, intent, context)
      
      return response
    } catch (error) {
      logger.error('Error processing voice input:', error)
      throw error
    }
  }

  async generateSpeech(text: string): Promise<Buffer> {
    if (!this.isInitialized) {
      throw new Error('Voice Assistant not initialized')
    }

    try {
      const audioBuffer = await this.tts.synthesize(text)
      return audioBuffer
    } catch (error) {
      logger.error('Error generating speech:', error)
      throw error
    }
  }

  async processConversation(audioInput: Buffer, sessionId: string = 'default'): Promise<Buffer> {
    try {
      // Process voice input to get text response
      const textResponse = await this.processVoiceInput(audioInput, sessionId)
      
      // Convert text response to speech
      const audioResponse = await this.generateSpeech(textResponse)
      
      return audioResponse
    } catch (error) {
      logger.error('Error processing conversation:', error)
      throw error
    }
  }

  async cleanup(): Promise<void> {
    try {
      logger.info('Cleaning up Voice Assistant...')
      
      if (this.stt) {
        await this.stt.cleanup()
      }
      
      if (this.tts) {
        await this.tts.cleanup()
      }
      
      if (this.intentClassifier) {
        await this.intentClassifier.cleanup()
      }
      
      if (this.contextManager) {
        await this.contextManager.cleanup()
      }
      
      if (this.audioProcessor) {
        await this.audioProcessor.cleanup()
      }
      
      this.isInitialized = false
      logger.info('Voice Assistant cleanup completed')
    } catch (error) {
      logger.error('Error during Voice Assistant cleanup:', error)
    }
  }

  getConfig(): VoiceConfig {
    return { ...this.config }
  }

  isReady(): boolean {
    return this.isInitialized
  }
}
