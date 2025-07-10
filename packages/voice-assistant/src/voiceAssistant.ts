import { EventEmitter } from 'events'
import { WhisperSTT } from './stt/whisperSTT'
import { CoquiTTS } from './tts/coquiTTS'
import { IntentClassifier } from './nlp/intentClassifier'
import { ContextManager } from './nlp/contextManager'
import { AudioProcessor } from './audio/audioProcessor'
import { logger } from '../utils/logger'

export interface VoiceInput {
  audioBuffer: Buffer
  sampleRate: number
  channels: number
  language?: string
}

export interface VoiceResponse {
  text: string
  audioBuffer: Buffer
  intent: string
  confidence: number
  actions: string[]
  metadata: Record<string, any>
}

export interface VoiceConfig {
  sttModel: string
  ttsModel: string
  language: string
  voiceId?: string
  maxRecordingTime: number
  silenceThreshold: number
  enableWakeWord: boolean
  wakeWord: string
}

export class VoiceAssistant extends EventEmitter {
  private whisperSTT: WhisperSTT
  private coquiTTS: CoquiTTS
  private intentClassifier: IntentClassifier
  private contextManager: ContextManager
  private audioProcessor: AudioProcessor
  private config: VoiceConfig
  private isInitialized = false
  private isListening = false
  private isProcessing = false

  constructor(config: VoiceConfig) {
    super()
    this.config = config
    
    this.whisperSTT = new WhisperSTT(config.sttModel)
    this.coquiTTS = new CoquiTTS(config.ttsModel, config.voiceId)
    this.intentClassifier = new IntentClassifier()
    this.contextManager = new ContextManager()
    this.audioProcessor = new AudioProcessor({
      sampleRate: 16000,
      channels: 1,
      silenceThreshold: config.silenceThreshold,
      maxRecordingTime: config.maxRecordingTime
    })

    this.setupEventListeners()
  }

  async initialize() {
    try {
      logger.info('Initializing Voice Assistant...')

      // Initialize STT
      await this.whisperSTT.initialize()
      logger.info('Whisper STT initialized')

      // Initialize TTS
      await this.coquiTTS.initialize()
      logger.info('Coqui TTS initialized')

      // Initialize NLP components
      await this.intentClassifier.initialize()
      logger.info('Intent classifier initialized')

      await this.contextManager.initialize()
      logger.info('Context manager initialized')

      // Initialize audio processor
      await this.audioProcessor.initialize()
      logger.info('Audio processor initialized')

      this.isInitialized = true
      logger.info('Voice Assistant initialized successfully')
      
      this.emit('initialized')
    } catch (error) {
      logger.error('Failed to initialize Voice Assistant:', error)
      throw error
    }
  }

  async startListening() {
    if (!this.isInitialized) {
      throw new Error('Voice Assistant not initialized')
    }

    if (this.isListening) {
      logger.warn('Already listening')
      return
    }

    try {
      this.isListening = true
      await this.audioProcessor.startRecording()
      logger.info('Voice Assistant started listening')
      this.emit('listening_started')
    } catch (error) {
      this.isListening = false
      logger.error('Failed to start listening:', error)
      throw error
    }
  }

  async stopListening() {
    if (!this.isListening) {
      return
    }

    try {
      this.isListening = false
      await this.audioProcessor.stopRecording()
      logger.info('Voice Assistant stopped listening')
      this.emit('listening_stopped')
    } catch (error) {
      logger.error('Failed to stop listening:', error)
      throw error
    }
  }

  async processVoiceInput(input: VoiceInput): Promise<VoiceResponse> {
    if (!this.isInitialized) {
      throw new Error('Voice Assistant not initialized')
    }

    if (this.isProcessing) {
      throw new Error('Already processing voice input')
    }

    this.isProcessing = true
    
    try {
      logger.info('Processing voice input...')
      this.emit('processing_started')

      // Step 1: Convert speech to text
      const transcription = await this.whisperSTT.transcribe(input.audioBuffer, {
        language: input.language || this.config.language,
        temperature: 0.1,
        best_of: 1
      })

      logger.info(`Transcription: "${transcription.text}"`)
      this.emit('transcription_complete', transcription)

      // Step 2: Classify intent
      const intent = await this.intentClassifier.classify(transcription.text)
      logger.info(`Intent: ${intent.intent} (confidence: ${intent.confidence})`)

      // Step 3: Update context
      await this.contextManager.updateContext({
        text: transcription.text,
        intent: intent.intent,
        timestamp: new Date(),
        confidence: intent.confidence
      })

      // Step 4: Generate response
      const responseText = await this.generateResponse(transcription.text, intent)
      logger.info(`Response: "${responseText}"`)

      // Step 5: Convert text to speech
      const audioBuffer = await this.coquiTTS.synthesize(responseText, {
        voiceId: this.config.voiceId,
        speed: 1.0,
        pitch: 1.0
      })

      const response: VoiceResponse = {
        text: responseText,
        audioBuffer,
        intent: intent.intent,
        confidence: intent.confidence,
        actions: intent.actions || [],
        metadata: {
          transcription: transcription.text,
          processingTime: Date.now() - transcription.timestamp,
          language: input.language || this.config.language
        }
      }

      this.emit('response_generated', response)
      logger.info('Voice input processed successfully')

      return response

    } catch (error) {
      logger.error('Failed to process voice input:', error)
      this.emit('processing_error', error)
      throw error
    } finally {
      this.isProcessing = false
      this.emit('processing_finished')
    }
  }

  private async generateResponse(text: string, intent: any): Promise<string> {
    const context = await this.contextManager.getContext()
    
    switch (intent.intent) {
      case 'check_sensors':
        return this.generateSensorResponse(intent.entities)
      
      case 'irrigation_status':
        return this.generateIrrigationResponse(intent.entities)
      
      case 'weather_info':
        return this.generateWeatherResponse(intent.entities)
      
      case 'crop_advice':
        return this.generateCropAdviceResponse(intent.entities)
      
      case 'task_management':
        return this.generateTaskResponse(intent.entities)
      
      case 'emergency_alert':
        return this.generateEmergencyResponse(intent.entities)
      
      case 'general_question':
        return this.generateGeneralResponse(text, context)
      
      default:
        return "I'm sorry, I didn't understand that. Could you please repeat or rephrase your question?"
    }
  }

  private async generateSensorResponse(entities: any[]): Promise<string> {
    // Mock sensor data - in real implementation, this would fetch from database
    const sensorData = {
      soil_moisture: 45,
      temperature: 23.5,
      humidity: 68,
      ph: 6.8
    }

    const sensorType = entities.find(e => e.entity === 'sensor_type')?.value
    
    if (sensorType) {
      const value = sensorData[sensorType as keyof typeof sensorData]
      if (value !== undefined) {
        return `The ${sensorType.replace('_', ' ')} level is currently ${value}${this.getSensorUnit(sensorType)}.`
      }
    }

    return `Here are your current sensor readings: Soil moisture is ${sensorData.soil_moisture}%, temperature is ${sensorData.temperature}°C, humidity is ${sensorData.humidity}%, and soil pH is ${sensorData.ph}.`
  }

  private async generateIrrigationResponse(entities: any[]): Promise<string> {
    // Mock irrigation data
    const irrigationStatus = {
      active: false,
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      zones: ['Zone 1', 'Zone 2', 'Zone 3']
    }

    if (irrigationStatus.active) {
      return 'Irrigation is currently active. It started 15 minutes ago and will run for another 30 minutes.'
    } else {
      return `Irrigation is not currently active. It last ran on ${irrigationStatus.lastRun.toLocaleDateString()} and is scheduled to run next on ${irrigationStatus.nextScheduled.toLocaleDateString()}.`
    }
  }

  private async generateWeatherResponse(entities: any[]): Promise<string> {
    // Mock weather data
    const weather = {
      current: {
        temperature: 26,
        humidity: 72,
        conditions: 'Partly cloudy',
        windSpeed: 8
      },
      forecast: [
        { day: 'Today', high: 28, low: 18, conditions: 'Sunny' },
        { day: 'Tomorrow', high: 30, low: 20, conditions: 'Partly cloudy' },
        { day: 'Day after', high: 27, low: 19, conditions: 'Light rain' }
      ]
    }

    return `Current weather is ${weather.current.conditions.toLowerCase()} with a temperature of ${weather.current.temperature}°C and humidity at ${weather.current.humidity}%. Tomorrow will be ${weather.forecast[1].conditions.toLowerCase()} with a high of ${weather.forecast[1].high}°C and low of ${weather.forecast[1].low}°C.`
  }

  private async generateCropAdviceResponse(entities: any[]): Promise<string> {
    const cropType = entities.find(e => e.entity === 'crop_type')?.value
    const advice = [
      'Based on current soil conditions, your crops are doing well.',
      'Consider applying fertilizer next week based on the soil nutrient levels.',
      'Monitor for pests as the weather conditions are favorable for their development.',
      'The soil moisture levels are adequate for the current growth stage.'
    ]

    return `For your ${cropType || 'crops'}: ${advice[Math.floor(Math.random() * advice.length)]}`
  }

  private async generateTaskResponse(entities: any[]): Promise<string> {
    // Mock task data
    const tasks = [
      { id: 1, title: 'Apply fertilizer to field A', due: 'Tomorrow' },
      { id: 2, title: 'Check irrigation system', due: 'Today' },
      { id: 3, title: 'Scout for pests', due: 'This week' }
    ]

    return `You have ${tasks.length} pending tasks. The most urgent is "${tasks[1].title}" which is due ${tasks[1].due}.`
  }

  private async generateEmergencyResponse(entities: any[]): Promise<string> {
    return 'I understand this is urgent. I\'m alerting the farm management system. Please check your dashboard for immediate actions and consider contacting your agricultural advisor if needed.'
  }

  private async generateGeneralResponse(text: string, context: any): Promise<string> {
    // For general questions, provide helpful farming-related responses
    const responses = [
      'I can help you with sensor readings, irrigation status, weather information, and crop advice. What would you like to know?',
      'For specific agricultural advice, I recommend consulting with your local agricultural extension office.',
      'You can ask me about current field conditions, upcoming tasks, or weather forecasts.',
      'I\'m here to help with your farming questions. Try asking about sensors, irrigation, or crop management.'
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  private getSensorUnit(sensorType: string): string {
    switch (sensorType) {
      case 'temperature': return '°C'
      case 'humidity': return '%'
      case 'soil_moisture': return '%'
      case 'ph': return ''
      default: return ''
    }
  }

  private setupEventListeners() {
    this.audioProcessor.on('audio_chunk', (chunk) => {
      this.emit('audio_chunk', chunk)
    })

    this.audioProcessor.on('recording_complete', async (audioBuffer) => {
      if (this.config.enableWakeWord) {
        const hasWakeWord = await this.detectWakeWord(audioBuffer)
        if (!hasWakeWord) {
          return
        }
      }

      try {
        const response = await this.processVoiceInput({
          audioBuffer,
          sampleRate: 16000,
          channels: 1,
          language: this.config.language
        })

        this.emit('response_ready', response)
      } catch (error) {
        this.emit('processing_error', error)
      }
    })

    this.audioProcessor.on('silence_detected', () => {
      this.emit('silence_detected')
    })

    this.audioProcessor.on('recording_error', (error) => {
      logger.error('Recording error:', error)
      this.emit('recording_error', error)
    })
  }

  private async detectWakeWord(audioBuffer: Buffer): Promise<boolean> {
    // Simple wake word detection - in production, use a dedicated wake word engine
    try {
      const transcription = await this.whisperSTT.transcribe(audioBuffer, {
        language: this.config.language,
        temperature: 0.1,
        best_of: 1
      })

      const text = transcription.text.toLowerCase()
      const wakeWord = this.config.wakeWord.toLowerCase()
      
      return text.includes(wakeWord)
    } catch (error) {
      logger.error('Wake word detection error:', error)
      return false
    }
  }

  async playResponse(response: VoiceResponse) {
    try {
      await this.audioProcessor.playAudio(response.audioBuffer)
      this.emit('response_played', response)
    } catch (error) {
      logger.error('Failed to play response:', error)
      this.emit('playback_error', error)
      throw error
    }
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      listening: this.isListening,
      processing: this.isProcessing,
      config: this.config
    }
  }

  async cleanup() {
    try {
      await this.stopListening()
      await this.audioProcessor.cleanup()
      await this.coquiTTS.cleanup()
      await this.whisperSTT.cleanup()
      
      this.isInitialized = false
      logger.info('Voice Assistant cleaned up successfully')
    } catch (error) {
      logger.error('Error during cleanup:', error)
      throw error
    }
  }
}
