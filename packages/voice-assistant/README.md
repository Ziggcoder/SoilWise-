# Voice Assistant Package - SoilWise Platform

## 🚀 Overview

The Voice Assistant package provides comprehensive speech recognition, natural language processing, and text-to-speech capabilities for the SoilWise platform. It enables farmers to interact with the system using voice commands in local languages, making the platform accessible even in hands-free farming scenarios.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Voice Assistant Package                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Speech        │  │   Natural       │  │   Text-to-  │ │
│  │   Recognition   │  │   Language      │  │   Speech    │ │
│  │   (Whisper)     │  │   Processing    │  │   (Coqui)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Voice         │  │   Command       │  │   Response  │ │
│  │   Activity      │  │   Processing    │  │   Generator │ │
│  │   Detection     │  │   (Intent)      │  │   (Context) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Multi-language│  │   Offline       │  │   Real-time │ │
│  │   Support       │  │   Processing    │  │   Streaming │ │
│  │   (i18n)        │  │   (Edge)        │  │   (WebRTC)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Speech Processing
- **Whisper** - OpenAI's speech recognition model
- **Coqui TTS** - Text-to-speech synthesis
- **WebRTC** - Real-time audio streaming
- **SpeechRecognition API** - Browser-based speech recognition
- **Web Audio API** - Audio processing and analysis

### Natural Language Processing
- **spaCy** - Natural language processing library
- **NLTK** - Natural language toolkit
- **Rasa** - Conversational AI framework
- **LangChain** - Language model integration
- **Transformers** - Pre-trained language models

### Audio Processing
- **FFmpeg** - Audio format conversion
- **SoX** - Audio processing utilities
- **WebAudio** - Browser audio processing
- **PyAudio** - Python audio I/O
- **Opus** - Audio compression

### Multi-language Support
- **i18next** - Internationalization framework
- **Google Translate API** - Translation services
- **Language Detection** - Automatic language detection
- **Polyglot** - Multi-language text processing

## 📁 Project Structure

```
src/
├── services/             # Core voice services
│   ├── speechRecognition.ts  # Speech-to-text service
│   ├── textToSpeech.ts      # Text-to-speech service
│   ├── voiceActivity.ts     # Voice activity detection
│   ├── commandProcessor.ts  # Command processing
│   └── languageService.ts   # Multi-language support
├── models/               # Voice processing models
│   ├── whisperModel.ts      # Whisper model wrapper
│   ├── coquiModel.ts        # Coqui TTS model wrapper
│   ├── intentModel.ts       # Intent recognition model
│   └── languageModel.ts     # Language detection model
├── processors/           # Audio processing
│   ├── audioProcessor.ts    # Audio preprocessing
│   ├── noiseReduction.ts    # Noise reduction
│   ├── volumeControl.ts     # Volume normalization
│   └── formatConverter.ts   # Audio format conversion
├── intents/              # Voice command intents
│   ├── sensorIntents.ts     # Sensor-related commands
│   ├── irrigationIntents.ts # Irrigation commands
│   ├── weatherIntents.ts    # Weather queries
│   └── generalIntents.ts    # General commands
├── responses/            # Response generation
│   ├── responseGenerator.ts # Dynamic response generation
│   ├── templateEngine.ts    # Response templates
│   └── contextManager.ts    # Conversation context
├── utils/                # Utility functions
│   ├── audioUtils.ts        # Audio processing utilities
│   ├── languageUtils.ts     # Language processing utilities
│   ├── validationUtils.ts   # Input validation
│   └── cacheUtils.ts        # Voice cache management
├── config/               # Configuration
│   ├── models.ts            # Model configurations
│   ├── languages.ts         # Language configurations
│   └── intents.ts           # Intent configurations
├── types/                # TypeScript types
│   ├── voice.ts             # Voice-related types
│   ├── audio.ts             # Audio processing types
│   └── intents.ts           # Intent types
└── server.ts             # Voice assistant server
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Python 3.9+ (for Whisper and Coqui)
- FFmpeg (for audio processing)
- CUDA (optional, for GPU acceleration)

### Installation

1. **Navigate to the voice assistant directory:**
```bash
cd packages/voice-assistant
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

4. **Download voice models:**
```bash
npm run download:models
```

5. **Setup environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

6. **Start the voice assistant:**
```bash
npm run dev
```

The voice assistant will be available at `http://localhost:8083`

### Available Scripts

```bash
npm run dev              # Start development server
npm run build           # Build TypeScript
npm run start           # Start production server
npm run test            # Run tests
npm run lint            # Lint code
npm run download:models # Download voice models
npm run train:intents   # Train intent recognition
npm run benchmark       # Benchmark voice processing
```

## 🎙️ Speech Recognition Service

### Whisper Integration
```typescript
// Speech recognition service using Whisper
export class SpeechRecognitionService {
  private whisperModel: WhisperModel;
  private audioProcessor: AudioProcessor;
  private vad: VoiceActivityDetector;

  constructor(config: VoiceConfig) {
    this.whisperModel = new WhisperModel({
      modelPath: config.whisperModelPath,
      language: config.defaultLanguage,
      device: config.device // 'cpu' or 'cuda'
    });
    
    this.audioProcessor = new AudioProcessor(config.audioConfig);
    this.vad = new VoiceActivityDetector(config.vadConfig);
  }

  async transcribeAudio(audioBuffer: Buffer, language?: string): Promise<TranscriptionResult> {
    try {
      // Voice activity detection
      const vadResult = await this.vad.detectVoiceActivity(audioBuffer);
      if (!vadResult.hasVoice) {
        return {
          text: '',
          confidence: 0,
          language: language || 'unknown',
          duration: vadResult.duration,
          segments: []
        };
      }

      // Audio preprocessing
      const processedAudio = await this.audioProcessor.preprocess(audioBuffer);
      
      // Language detection if not specified
      const detectedLanguage = language || await this.detectLanguage(processedAudio);
      
      // Transcription
      const transcription = await this.whisperModel.transcribe(processedAudio, {
        language: detectedLanguage,
        task: 'transcribe',
        temperature: 0.0,
        best_of: 1
      });
      
      return {
        text: transcription.text,
        confidence: transcription.confidence,
        language: detectedLanguage,
        duration: transcription.duration,
        segments: transcription.segments,
        words: transcription.words
      };
    } catch (error) {
      logger.error('Speech recognition error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async transcribeRealtime(audioStream: ReadableStream, language?: string): Promise<AsyncGenerator<TranscriptionResult>> {
    const whisperStream = this.whisperModel.createStream({
      language: language || 'auto',
      chunk_length: 30,
      stride_length: 5
    });

    audioStream.pipe(whisperStream);

    async function* generateTranscriptions() {
      for await (const chunk of whisperStream) {
        yield {
          text: chunk.text,
          confidence: chunk.confidence,
          language: chunk.language,
          isPartial: chunk.is_partial,
          timestamp: chunk.timestamp
        };
      }
    }

    return generateTranscriptions();
  }

  private async detectLanguage(audioBuffer: Buffer): Promise<string> {
    // Use Whisper's language detection capability
    const detection = await this.whisperModel.detectLanguage(audioBuffer);
    return detection.language;
  }

  async getAvailableLanguages(): Promise<string[]> {
    return [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
      'ar', 'hi', 'th', 'vi', 'id', 'ms', 'tl', 'sw', 'am', 'yo'
    ];
  }
}
```

### Voice Activity Detection
```typescript
// Voice activity detection service
export class VoiceActivityDetector {
  private vadModel: any;
  private silenceThreshold: number = 0.01;
  private minSpeechDuration: number = 0.5; // seconds
  private maxSilenceDuration: number = 2.0; // seconds

  constructor(config: VADConfig) {
    this.silenceThreshold = config.silenceThreshold || 0.01;
    this.minSpeechDuration = config.minSpeechDuration || 0.5;
    this.maxSilenceDuration = config.maxSilenceDuration || 2.0;
    this.loadVADModel(config.modelPath);
  }

  async detectVoiceActivity(audioBuffer: Buffer): Promise<VADResult> {
    try {
      // Convert audio to the required format
      const audioArray = this.bufferToFloat32Array(audioBuffer);
      
      // Apply VAD algorithm
      const vadSegments = await this.runVAD(audioArray);
      
      // Analyze segments
      const analysis = this.analyzeSegments(vadSegments);
      
      return {
        hasVoice: analysis.hasVoice,
        confidence: analysis.confidence,
        duration: analysis.duration,
        speechSegments: analysis.speechSegments,
        silenceSegments: analysis.silenceSegments,
        speechRatio: analysis.speechRatio
      };
    } catch (error) {
      logger.error('VAD error:', error);
      throw new Error('Failed to detect voice activity');
    }
  }

  private async runVAD(audioArray: Float32Array): Promise<VADSegment[]> {
    const segments: VADSegment[] = [];
    const windowSize = 1024;
    const hopSize = 512;
    const sampleRate = 16000;
    
    for (let i = 0; i < audioArray.length - windowSize; i += hopSize) {
      const window = audioArray.slice(i, i + windowSize);
      
      // Calculate energy
      const energy = this.calculateEnergy(window);
      
      // Apply VAD model if available, otherwise use energy threshold
      const isSpeech = this.vadModel 
        ? await this.vadModel.predict(window) > 0.5
        : energy > this.silenceThreshold;
      
      segments.push({
        start: i / sampleRate,
        end: (i + windowSize) / sampleRate,
        isSpeech,
        energy,
        confidence: isSpeech ? energy : 1 - energy
      });
    }
    
    return segments;
  }

  private calculateEnergy(window: Float32Array): number {
    let energy = 0;
    for (let i = 0; i < window.length; i++) {
      energy += window[i] * window[i];
    }
    return Math.sqrt(energy / window.length);
  }

  private analyzeSegments(segments: VADSegment[]): VADAnalysis {
    const speechSegments = segments.filter(s => s.isSpeech);
    const silenceSegments = segments.filter(s => !s.isSpeech);
    
    const totalDuration = segments.length > 0 
      ? segments[segments.length - 1].end - segments[0].start
      : 0;
    
    const speechDuration = speechSegments.reduce((sum, s) => sum + (s.end - s.start), 0);
    const speechRatio = totalDuration > 0 ? speechDuration / totalDuration : 0;
    
    // Determine if there's significant voice activity
    const hasVoice = speechDuration >= this.minSpeechDuration && speechRatio > 0.1;
    
    return {
      hasVoice,
      confidence: speechRatio,
      duration: totalDuration,
      speechSegments,
      silenceSegments,
      speechRatio
    };
  }
}
```

## 🔊 Text-to-Speech Service

### Coqui TTS Integration
```typescript
// Text-to-speech service using Coqui TTS
export class TextToSpeechService {
  private ttsModel: CoquiTTSModel;
  private voiceCloner: VoiceCloner;
  private audioProcessor: AudioProcessor;

  constructor(config: VoiceConfig) {
    this.ttsModel = new CoquiTTSModel({
      modelPath: config.ttsModelPath,
      configPath: config.ttsConfigPath,
      device: config.device
    });
    
    this.voiceCloner = new VoiceCloner(config.voiceClonerConfig);
    this.audioProcessor = new AudioProcessor(config.audioConfig);
  }

  async synthesizeSpeech(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    try {
      // Text preprocessing
      const processedText = this.preprocessText(text, options.language);
      
      // Select voice
      const voice = await this.selectVoice(options);
      
      // Generate speech
      const audioBuffer = await this.ttsModel.synthesize(processedText, {
        voice: voice,
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0,
        volume: options.volume || 1.0,
        emotion: options.emotion || 'neutral'
      });
      
      // Post-process audio
      const processedAudio = await this.audioProcessor.postprocess(audioBuffer, options);
      
      return {
        audioBuffer: processedAudio,
        duration: this.calculateDuration(processedAudio),
        sampleRate: 22050,
        format: 'wav',
        metadata: {
          text,
          voice: voice.name,
          language: options.language || 'en',
          speed: options.speed || 1.0
        }
      };
    } catch (error) {
      logger.error('TTS error:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  async synthesizeSSML(ssml: string, options: TTSOptions = {}): Promise<TTSResult> {
    try {
      // Parse SSML
      const parsedSSML = this.parseSSML(ssml);
      
      // Generate speech with SSML parameters
      const audioBuffer = await this.ttsModel.synthesizeSSML(parsedSSML, options);
      
      return {
        audioBuffer,
        duration: this.calculateDuration(audioBuffer),
        sampleRate: 22050,
        format: 'wav',
        metadata: { ssml, ...options }
      };
    } catch (error) {
      logger.error('SSML synthesis error:', error);
      throw new Error('Failed to synthesize SSML');
    }
  }

  async cloneVoice(referenceAudio: Buffer, targetText: string): Promise<TTSResult> {
    try {
      // Extract voice characteristics
      const voiceEmbedding = await this.voiceCloner.extractVoiceEmbedding(referenceAudio);
      
      // Synthesize with cloned voice
      const audioBuffer = await this.ttsModel.synthesizeWithEmbedding(
        targetText,
        voiceEmbedding
      );
      
      return {
        audioBuffer,
        duration: this.calculateDuration(audioBuffer),
        sampleRate: 22050,
        format: 'wav',
        metadata: {
          text: targetText,
          voice: 'cloned',
          isCloned: true
        }
      };
    } catch (error) {
      logger.error('Voice cloning error:', error);
      throw new Error('Failed to clone voice');
    }
  }

  private preprocessText(text: string, language: string = 'en'): string {
    // Text normalization
    let processed = text.trim();
    
    // Expand abbreviations
    processed = this.expandAbbreviations(processed, language);
    
    // Normalize numbers
    processed = this.normalizeNumbers(processed, language);
    
    // Handle special characters
    processed = this.handleSpecialCharacters(processed);
    
    return processed;
  }

  private expandAbbreviations(text: string, language: string): string {
    const abbreviations = {
      en: {
        'Dr.': 'Doctor',
        'Mr.': 'Mister',
        'Mrs.': 'Missus',
        'Ms.': 'Miss',
        'Prof.': 'Professor',
        'etc.': 'etcetera',
        'vs.': 'versus',
        'e.g.': 'for example',
        'i.e.': 'that is'
      },
      es: {
        'Dr.': 'Doctor',
        'Sra.': 'Señora',
        'Sr.': 'Señor',
        'etc.': 'etcétera'
      }
    };
    
    const langAbbreviations = abbreviations[language] || abbreviations.en;
    
    let result = text;
    for (const [abbr, expansion] of Object.entries(langAbbreviations)) {
      const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'gi');
      result = result.replace(regex, expansion);
    }
    
    return result;
  }

  private normalizeNumbers(text: string, language: string): string {
    // Convert numbers to words
    const numberRegex = /\b\d+\b/g;
    
    return text.replace(numberRegex, (match) => {
      const number = parseInt(match);
      return this.numberToWords(number, language);
    });
  }

  private numberToWords(num: number, language: string): string {
    // Simple number to words conversion
    // In production, use a proper i18n library
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    
    // For larger numbers, implement more complex logic
    return num.toString(); // Fallback
  }

  async getAvailableVoices(): Promise<Voice[]> {
    return [
      {
        id: 'jenny',
        name: 'Jenny',
        language: 'en',
        gender: 'female',
        description: 'Clear female voice'
      },
      {
        id: 'ryan',
        name: 'Ryan',
        language: 'en',
        gender: 'male',
        description: 'Professional male voice'
      },
      {
        id: 'maria',
        name: 'Maria',
        language: 'es',
        gender: 'female',
        description: 'Spanish female voice'
      }
    ];
  }
}
```

## 🤖 Command Processing Service

### Intent Recognition
```typescript
// Command processing with intent recognition
export class CommandProcessorService {
  private intentClassifier: IntentClassifier;
  private entityExtractor: EntityExtractor;
  private responseGenerator: ResponseGenerator;
  private contextManager: ContextManager;

  constructor(config: CommandProcessorConfig) {
    this.intentClassifier = new IntentClassifier(config.intentModelPath);
    this.entityExtractor = new EntityExtractor(config.entityModelPath);
    this.responseGenerator = new ResponseGenerator(config.responseConfig);
    this.contextManager = new ContextManager();
  }

  async processCommand(
    text: string, 
    context: ConversationContext
  ): Promise<CommandResult> {
    try {
      // Update context
      this.contextManager.updateContext(context, text);
      
      // Classify intent
      const intent = await this.intentClassifier.classify(text);
      
      // Extract entities
      const entities = await this.entityExtractor.extract(text);
      
      // Execute command
      const actionResult = await this.executeCommand(intent, entities, context);
      
      // Generate response
      const response = await this.responseGenerator.generate(
        actionResult,
        intent,
        entities,
        context
      );
      
      return {
        intent: intent.name,
        confidence: intent.confidence,
        entities,
        action: actionResult.action,
        response: response.text,
        audioResponse: response.audio,
        followUp: response.followUp,
        context: this.contextManager.getContext()
      };
    } catch (error) {
      logger.error('Command processing error:', error);
      return this.generateErrorResponse(error);
    }
  }

  private async executeCommand(
    intent: Intent,
    entities: Entity[],
    context: ConversationContext
  ): Promise<ActionResult> {
    switch (intent.name) {
      case 'get_sensor_data':
        return await this.getSensorData(entities, context);
      
      case 'control_irrigation':
        return await this.controlIrrigation(entities, context);
      
      case 'get_weather':
        return await this.getWeather(entities, context);
      
      case 'get_crop_advice':
        return await this.getCropAdvice(entities, context);
      
      case 'create_alert':
        return await this.createAlert(entities, context);
      
      case 'get_farm_status':
        return await this.getFarmStatus(entities, context);
      
      default:
        return {
          action: 'unknown_command',
          success: false,
          message: `I don't understand the command: ${intent.name}`
        };
    }
  }

  private async getSensorData(entities: Entity[], context: ConversationContext): Promise<ActionResult> {
    try {
      // Extract sensor type and farm from entities
      const sensorType = entities.find(e => e.type === 'sensor_type')?.value;
      const farmId = entities.find(e => e.type === 'farm_id')?.value || context.farmId;
      
      if (!farmId) {
        return {
          action: 'get_sensor_data',
          success: false,
          message: 'Which farm would you like to check?',
          requiresInput: true
        };
      }
      
      // Fetch sensor data
      const sensorData = await sensorService.getLatestReadings(farmId, sensorType);
      
      return {
        action: 'get_sensor_data',
        success: true,
        data: sensorData,
        message: this.formatSensorDataMessage(sensorData)
      };
    } catch (error) {
      return {
        action: 'get_sensor_data',
        success: false,
        message: 'Sorry, I couldn\'t retrieve the sensor data right now.'
      };
    }
  }

  private async controlIrrigation(entities: Entity[], context: ConversationContext): Promise<ActionResult> {
    try {
      const action = entities.find(e => e.type === 'irrigation_action')?.value;
      const duration = entities.find(e => e.type === 'duration')?.value;
      const farmId = entities.find(e => e.type === 'farm_id')?.value || context.farmId;
      
      if (!farmId) {
        return {
          action: 'control_irrigation',
          success: false,
          message: 'Which farm\'s irrigation would you like to control?',
          requiresInput: true
        };
      }
      
      // Execute irrigation command
      const result = await irrigationService.controlIrrigation(farmId, action, duration);
      
      return {
        action: 'control_irrigation',
        success: result.success,
        message: result.success 
          ? `Irrigation ${action} successfully${duration ? ` for ${duration} minutes` : ''}`
          : 'Failed to control irrigation system'
      };
    } catch (error) {
      return {
        action: 'control_irrigation',
        success: false,
        message: 'Sorry, I couldn\'t control the irrigation system right now.'
      };
    }
  }

  private async getWeather(entities: Entity[], context: ConversationContext): Promise<ActionResult> {
    try {
      const location = entities.find(e => e.type === 'location')?.value || context.location;
      const timeframe = entities.find(e => e.type === 'timeframe')?.value || 'today';
      
      if (!location) {
        return {
          action: 'get_weather',
          success: false,
          message: 'Which location would you like the weather for?',
          requiresInput: true
        };
      }
      
      // Get weather data
      const weather = await weatherService.getWeather(location, timeframe);
      
      return {
        action: 'get_weather',
        success: true,
        data: weather,
        message: this.formatWeatherMessage(weather, timeframe)
      };
    } catch (error) {
      return {
        action: 'get_weather',
        success: false,
        message: 'Sorry, I couldn\'t get the weather information right now.'
      };
    }
  }

  private async getCropAdvice(entities: Entity[], context: ConversationContext): Promise<ActionResult> {
    try {
      const cropType = entities.find(e => e.type === 'crop_type')?.value;
      const issue = entities.find(e => e.type === 'crop_issue')?.value;
      const farmId = entities.find(e => e.type === 'farm_id')?.value || context.farmId;
      
      if (!farmId) {
        return {
          action: 'get_crop_advice',
          success: false,
          message: 'Which farm would you like advice for?',
          requiresInput: true
        };
      }
      
      // Get crop advice
      const advice = await aiService.getCropAdvice(farmId, cropType, issue);
      
      return {
        action: 'get_crop_advice',
        success: true,
        data: advice,
        message: this.formatCropAdviceMessage(advice)
      };
    } catch (error) {
      return {
        action: 'get_crop_advice',
        success: false,
        message: 'Sorry, I couldn\'t get crop advice right now.'
      };
    }
  }

  private formatSensorDataMessage(sensorData: any): string {
    const readings = sensorData.readings;
    if (!readings || readings.length === 0) {
      return 'No sensor data available.';
    }
    
    const latest = readings[0];
    let message = `Here are the latest sensor readings: `;
    
    if (latest.temperature) {
      message += `Temperature is ${latest.temperature}°C. `;
    }
    
    if (latest.humidity) {
      message += `Humidity is ${latest.humidity}%. `;
    }
    
    if (latest.soilMoisture) {
      message += `Soil moisture is ${latest.soilMoisture}%. `;
    }
    
    if (latest.ph) {
      message += `Soil pH is ${latest.ph}. `;
    }
    
    return message.trim();
  }

  private formatWeatherMessage(weather: any, timeframe: string): string {
    const current = weather.current;
    let message = `The weather ${timeframe} is ${current.description}. `;
    message += `Temperature is ${current.temperature}°C. `;
    
    if (current.humidity) {
      message += `Humidity is ${current.humidity}%. `;
    }
    
    if (current.windSpeed) {
      message += `Wind speed is ${current.windSpeed} km/h. `;
    }
    
    if (weather.forecast && weather.forecast.length > 0) {
      const tomorrow = weather.forecast[0];
      message += `Tomorrow's forecast: ${tomorrow.description} with a high of ${tomorrow.high}°C and low of ${tomorrow.low}°C.`;
    }
    
    return message;
  }

  private formatCropAdviceMessage(advice: any): string {
    let message = 'Here\'s my crop advice: ';
    
    if (advice.irrigation) {
      message += `${advice.irrigation.recommendation}. `;
    }
    
    if (advice.fertilization) {
      message += `${advice.fertilization.recommendation}. `;
    }
    
    if (advice.pestDisease) {
      message += `${advice.pestDisease.recommendation}. `;
    }
    
    if (advice.timing) {
      message += `Best time for next action: ${advice.timing.recommendation}. `;
    }
    
    return message;
  }
}
```

## 🌍 Multi-language Support

### Language Service
```typescript
// Multi-language support service
export class LanguageService {
  private supportedLanguages: Map<string, LanguageConfig> = new Map();
  private translationService: TranslationService;
  private localizationManager: LocalizationManager;

  constructor(config: LanguageConfig) {
    this.initializeSupportedLanguages();
    this.translationService = new TranslationService(config.translationConfig);
    this.localizationManager = new LocalizationManager(config.localizationConfig);
  }

  private initializeSupportedLanguages() {
    this.supportedLanguages.set('en', {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      rtl: false,
      ttsVoices: ['jenny', 'ryan'],
      sttModel: 'whisper-en',
      confidence: 0.95
    });

    this.supportedLanguages.set('es', {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      rtl: false,
      ttsVoices: ['maria', 'carlos'],
      sttModel: 'whisper-es',
      confidence: 0.90
    });

    this.supportedLanguages.set('fr', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      rtl: false,
      ttsVoices: ['claire', 'pierre'],
      sttModel: 'whisper-fr',
      confidence: 0.88
    });

    this.supportedLanguages.set('hi', {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      rtl: false,
      ttsVoices: ['priya', 'arjun'],
      sttModel: 'whisper-hi',
      confidence: 0.85
    });

    this.supportedLanguages.set('sw', {
      code: 'sw',
      name: 'Swahili',
      nativeName: 'Kiswahili',
      rtl: false,
      ttsVoices: ['amina', 'jabari'],
      sttModel: 'whisper-sw',
      confidence: 0.82
    });
  }

  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      // Use multiple detection methods for better accuracy
      const detections = await Promise.all([
        this.detectWithNLP(text),
        this.detectWithAPI(text),
        this.detectWithStatistics(text)
      ]);

      // Combine results
      const combined = this.combineDetectionResults(detections);
      
      return {
        language: combined.language,
        confidence: combined.confidence,
        alternativeLanguages: combined.alternatives,
        isSupported: this.supportedLanguages.has(combined.language)
      };
    } catch (error) {
      logger.error('Language detection error:', error);
      return {
        language: 'en',
        confidence: 0.5,
        alternativeLanguages: [],
        isSupported: true
      };
    }
  }

  async translateText(text: string, fromLang: string, toLang: string): Promise<TranslationResult> {
    try {
      // Check if translation is needed
      if (fromLang === toLang) {
        return {
          text,
          translatedText: text,
          confidence: 1.0,
          fromLanguage: fromLang,
          toLanguage: toLang
        };
      }

      // Translate using the translation service
      const translation = await this.translationService.translate(text, fromLang, toLang);
      
      return {
        text,
        translatedText: translation.text,
        confidence: translation.confidence,
        fromLanguage: fromLang,
        toLanguage: toLang
      };
    } catch (error) {
      logger.error('Translation error:', error);
      throw new Error('Failed to translate text');
    }
  }

  async localizeResponse(response: string, language: string, context: any = {}): Promise<string> {
    try {
      // Use localization templates for common responses
      const template = this.localizationManager.getTemplate(response, language);
      
      if (template) {
        return this.localizationManager.interpolate(template, context);
      }
      
      // Fall back to translation if no template exists
      if (language !== 'en') {
        const translation = await this.translateText(response, 'en', language);
        return translation.translatedText;
      }
      
      return response;
    } catch (error) {
      logger.error('Localization error:', error);
      return response; // Return original text as fallback
    }
  }

  getSupportedLanguages(): LanguageConfig[] {
    return Array.from(this.supportedLanguages.values());
  }

  isLanguageSupported(language: string): boolean {
    return this.supportedLanguages.has(language);
  }

  getLanguageConfig(language: string): LanguageConfig | null {
    return this.supportedLanguages.get(language) || null;
  }

  private async detectWithNLP(text: string): Promise<DetectionResult> {
    // Use NLP-based language detection
    const nlp = require('franc');
    const detected = nlp(text);
    
    return {
      language: detected,
      confidence: 0.8,
      method: 'nlp'
    };
  }

  private async detectWithAPI(text: string): Promise<DetectionResult> {
    // Use external API for language detection
    try {
      const result = await this.translationService.detectLanguage(text);
      return {
        language: result.language,
        confidence: result.confidence,
        method: 'api'
      };
    } catch (error) {
      return {
        language: 'en',
        confidence: 0.5,
        method: 'api'
      };
    }
  }

  private async detectWithStatistics(text: string): Promise<DetectionResult> {
    // Use statistical analysis for language detection
    const languageFrequencies = new Map();
    
    // Analyze character frequencies, common words, etc.
    // This is a simplified implementation
    const commonWords = {
      en: ['the', 'and', 'is', 'a', 'to', 'of', 'in', 'for', 'with', 'on'],
      es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
      fr: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      hi: ['है', 'के', 'में', 'की', 'को', 'से', 'पर', 'का', 'यह', 'एक'],
      sw: ['na', 'ya', 'wa', 'ni', 'kwa', 'za', 'hii', 'hizo', 'hao', 'haya']
    };
    
    const words = text.toLowerCase().split(/\s+/);
    let bestMatch = 'en';
    let bestScore = 0;
    
    for (const [lang, commonWordsArray] of Object.entries(commonWords)) {
      const score = words.filter(word => commonWordsArray.includes(word)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = lang;
      }
    }
    
    return {
      language: bestMatch,
      confidence: Math.min(0.9, bestScore / words.length * 10),
      method: 'statistical'
    };
  }

  private combineDetectionResults(detections: DetectionResult[]): DetectionResult {
    // Combine multiple detection results for better accuracy
    const languageScores = new Map();
    
    for (const detection of detections) {
      const current = languageScores.get(detection.language) || 0;
      languageScores.set(detection.language, current + detection.confidence);
    }
    
    // Find the language with the highest combined score
    let bestLanguage = 'en';
    let bestScore = 0;
    
    for (const [language, score] of languageScores) {
      if (score > bestScore) {
        bestScore = score;
        bestLanguage = language;
      }
    }
    
    return {
      language: bestLanguage,
      confidence: Math.min(1.0, bestScore / detections.length),
      method: 'combined'
    };
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=8083
NODE_ENV=development

# Model Paths
WHISPER_MODEL_PATH=./models/whisper-base.bin
COQUI_MODEL_PATH=./models/tts-model.bin
INTENT_MODEL_PATH=./models/intent-classifier.bin

# Audio Configuration
SAMPLE_RATE=16000
AUDIO_FORMAT=wav
MAX_AUDIO_DURATION=30
SILENCE_THRESHOLD=0.01

# Language Configuration
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,es,fr,hi,sw
TRANSLATION_API_KEY=your-translation-api-key

# TTS Configuration
DEFAULT_VOICE=jenny
SPEECH_RATE=1.0
SPEECH_PITCH=1.0
SPEECH_VOLUME=1.0

# Processing Configuration
ENABLE_VAD=true
ENABLE_NOISE_REDUCTION=true
ENABLE_ECHO_CANCELLATION=true
PROCESSING_TIMEOUT=10000

# GPU Configuration
ENABLE_GPU=false
CUDA_DEVICE=0
```

### Intent Configuration
```typescript
// Intent configuration for command recognition
export const intentConfigs = {
  sensor_intents: {
    'get_sensor_data': {
      patterns: [
        'what is the temperature',
        'check soil moisture',
        'sensor readings',
        'how is the humidity',
        'show me the sensor data'
      ],
      entities: ['sensor_type', 'farm_id', 'timeframe'],
      responses: [
        'Here are the latest sensor readings',
        'The current sensor data shows',
        'According to the sensors'
      ]
    },
    'sensor_status': {
      patterns: [
        'are sensors working',
        'sensor status',
        'check sensor health',
        'sensor connectivity'
      ],
      entities: ['sensor_id', 'farm_id'],
      responses: [
        'All sensors are operational',
        'Sensor status is',
        'The sensors are currently'
      ]
    }
  },
  irrigation_intents: {
    'control_irrigation': {
      patterns: [
        'turn on irrigation',
        'start watering',
        'stop irrigation',
        'water the crops',
        'irrigation for 30 minutes'
      ],
      entities: ['irrigation_action', 'duration', 'farm_id', 'zone'],
      responses: [
        'Irrigation system activated',
        'Starting irrigation',
        'Stopping irrigation'
      ]
    },
    'irrigation_schedule': {
      patterns: [
        'when is next irrigation',
        'irrigation schedule',
        'watering schedule',
        'next watering time'
      ],
      entities: ['farm_id', 'timeframe'],
      responses: [
        'Next irrigation is scheduled for',
        'The irrigation schedule shows',
        'Watering is planned for'
      ]
    }
  },
  weather_intents: {
    'get_weather': {
      patterns: [
        'what is the weather',
        'weather forecast',
        'will it rain',
        'temperature today',
        'weather for tomorrow'
      ],
      entities: ['location', 'timeframe', 'weather_type'],
      responses: [
        'The weather forecast shows',
        'Current weather conditions are',
        'Tomorrow\'s weather will be'
      ]
    }
  },
  advice_intents: {
    'get_crop_advice': {
      patterns: [
        'what should I do',
        'crop advice',
        'farming recommendations',
        'help with crops',
        'crop problems'
      ],
      entities: ['crop_type', 'issue_type', 'farm_id'],
      responses: [
        'Based on current conditions, I recommend',
        'For your crops, you should',
        'The best advice for your situation is'
      ]
    }
  }
};
```

## 🧪 Testing

### Voice Processing Tests
```typescript
// Voice processing tests
describe('VoiceAssistant', () => {
  let speechRecognition: SpeechRecognitionService;
  let textToSpeech: TextToSpeechService;
  let commandProcessor: CommandProcessorService;

  beforeEach(() => {
    speechRecognition = new SpeechRecognitionService(testConfig);
    textToSpeech = new TextToSpeechService(testConfig);
    commandProcessor = new CommandProcessorService(testConfig);
  });

  describe('Speech Recognition', () => {
    it('should transcribe audio correctly', async () => {
      const audioBuffer = fs.readFileSync('./test/audio/test-speech.wav');
      
      const result = await speechRecognition.transcribeAudio(audioBuffer);
      
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.language).toBe('en');
    });

    it('should handle multiple languages', async () => {
      const spanishAudio = fs.readFileSync('./test/audio/spanish-speech.wav');
      
      const result = await speechRecognition.transcribeAudio(spanishAudio);
      
      expect(result.language).toBe('es');
      expect(result.text).toBeDefined();
    });

    it('should detect voice activity', async () => {
      const audioBuffer = fs.readFileSync('./test/audio/with-silence.wav');
      
      const vad = new VoiceActivityDetector(testConfig);
      const result = await vad.detectVoiceActivity(audioBuffer);
      
      expect(result.hasVoice).toBe(true);
      expect(result.speechRatio).toBeGreaterThan(0.2);
    });
  });

  describe('Text-to-Speech', () => {
    it('should synthesize speech', async () => {
      const text = 'Hello, the temperature is 25 degrees Celsius';
      
      const result = await textToSpeech.synthesizeSpeech(text);
      
      expect(result.audioBuffer).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.format).toBe('wav');
    });

    it('should handle different languages', async () => {
      const text = 'Hola, la temperatura es 25 grados';
      
      const result = await textToSpeech.synthesizeSpeech(text, {
        language: 'es',
        voice: 'maria'
      });
      
      expect(result.audioBuffer).toBeDefined();
      expect(result.metadata.language).toBe('es');
    });
  });

  describe('Command Processing', () => {
    it('should process sensor commands', async () => {
      const command = 'what is the temperature';
      const context = { farmId: 'test-farm' };
      
      const result = await commandProcessor.processCommand(command, context);
      
      expect(result.intent).toBe('get_sensor_data');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.response).toBeDefined();
    });

    it('should handle irrigation commands', async () => {
      const command = 'turn on irrigation for 30 minutes';
      const context = { farmId: 'test-farm' };
      
      const result = await commandProcessor.processCommand(command, context);
      
      expect(result.intent).toBe('control_irrigation');
      expect(result.entities).toContainEqual(
        expect.objectContaining({ type: 'duration', value: '30' })
      );
    });

    it('should handle multi-language commands', async () => {
      const command = 'enciende el riego';
      const context = { farmId: 'test-farm', language: 'es' };
      
      const result = await commandProcessor.processCommand(command, context);
      
      expect(result.intent).toBe('control_irrigation');
      expect(result.response).toBeDefined();
    });
  });
});
```

### Performance Tests
```typescript
// Performance benchmarks
describe('Performance Tests', () => {
  it('should process speech recognition within time limits', async () => {
    const audioBuffer = fs.readFileSync('./test/audio/test-speech.wav');
    
    const startTime = Date.now();
    const result = await speechRecognition.transcribeAudio(audioBuffer);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    expect(result.text).toBeDefined();
  });

  it('should synthesize speech quickly', async () => {
    const text = 'This is a test of the text-to-speech system';
    
    const startTime = Date.now();
    const result = await textToSpeech.synthesizeSpeech(text);
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    expect(result.audioBuffer).toBeDefined();
  });

  it('should handle concurrent requests', async () => {
    const requests = Array.from({ length: 5 }, (_, i) => 
      commandProcessor.processCommand(`test command ${i}`, { farmId: 'test-farm' })
    );
    
    const results = await Promise.all(requests);
    
    expect(results).toHaveLength(5);
    results.forEach(result => {
      expect(result.intent).toBeDefined();
      expect(result.response).toBeDefined();
    });
  });
});
```

## 🚀 Performance Optimization

### Audio Processing Optimization
```typescript
// Optimized audio processing
export class OptimizedAudioProcessor {
  private audioContext: AudioContext;
  private worklet: AudioWorkletNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.setupAudioWorklet();
  }

  private async setupAudioWorklet() {
    // Use AudioWorklet for better performance
    await this.audioContext.audioWorklet.addModule('./audio-processor-worklet.js');
    
    this.worklet = new AudioWorkletNode(this.audioContext, 'audio-processor', {
      processorOptions: {
        sampleRate: 16000,
        bufferSize: 1024
      }
    });
  }

  async processAudioStream(stream: MediaStream): Promise<AudioBuffer> {
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.worklet);
    
    // Process audio in real-time with minimal latency
    return new Promise((resolve) => {
      this.worklet.port.onmessage = (event) => {
        if (event.data.type === 'audio-processed') {
          resolve(event.data.audioBuffer);
        }
      };
    });
  }
}
```

### Model Loading Optimization
```typescript
// Optimized model loading
export class ModelManager {
  private modelCache: Map<string, any> = new Map();
  private preloadedModels: Set<string> = new Set();

  async preloadModels(modelNames: string[]): Promise<void> {
    const promises = modelNames.map(name => this.loadModel(name));
    await Promise.all(promises);
    
    modelNames.forEach(name => this.preloadedModels.add(name));
  }

  async loadModel(modelName: string): Promise<any> {
    if (this.modelCache.has(modelName)) {
      return this.modelCache.get(modelName);
    }

    const model = await this.loadModelFromDisk(modelName);
    this.modelCache.set(modelName, model);
    
    return model;
  }

  private async loadModelFromDisk(modelName: string): Promise<any> {
    // Optimized model loading with compression
    const modelPath = `./models/${modelName}`;
    
    if (modelName.endsWith('.tflite')) {
      return await this.loadTFLiteModel(modelPath);
    } else if (modelName.endsWith('.onnx')) {
      return await this.loadONNXModel(modelPath);
    }
    
    throw new Error(`Unsupported model format: ${modelName}`);
  }
}
```

## 🔒 Security and Privacy

### Audio Data Security
```typescript
// Security measures for audio data
export class AudioSecurityManager {
  private encryptionKey: Buffer;
  
  constructor(config: SecurityConfig) {
    this.encryptionKey = crypto.randomBytes(32);
  }

  encryptAudioData(audioBuffer: Buffer): Buffer {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    const encrypted = Buffer.concat([
      cipher.update(audioBuffer),
      cipher.final()
    ]);
    
    return encrypted;
  }

  decryptAudioData(encryptedBuffer: Buffer): Buffer {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);
    
    return decrypted;
  }

  sanitizeAudioData(audioBuffer: Buffer): Buffer {
    // Remove metadata and personal identifiers
    // Implement audio sanitization logic
    return audioBuffer;
  }

  async deleteAudioData(audioId: string): Promise<void> {
    // Secure deletion of audio data
    // Implement secure deletion logic
  }
}
```

## 🤝 Contributing

1. Follow the main project's [Contributing Guidelines](../../CONTRIBUTING.md)
2. Test voice features on actual hardware
3. Consider latency and performance constraints
4. Test with multiple languages and accents
5. Ensure privacy and security compliance

## 📚 Additional Resources

- [Whisper Documentation](https://github.com/openai/whisper)
- [Coqui TTS Documentation](https://tts.readthedocs.io/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [WebRTC Documentation](https://webrtc.org/getting-started/)
- [Main Project Documentation](../../docs/README.md)
