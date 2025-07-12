export interface AIConfig {
  ollama: {
    baseUrl: string
    model: string
    temperature: number
    maxTokens: number
    timeout: number
  }
  whisper: {
    modelPath: string
    modelSize: 'tiny' | 'base' | 'small' | 'medium' | 'large'
    language: string
    device: 'cpu' | 'gpu'
  }
  coqui: {
    modelPath: string
    voiceModel: string
    language: string
    speakingRate: number
    pitch: number
  }
  chromadb: {
    host: string
    port: number
    collectionName: string
    embeddingModel: string
  }
  features: {
    enableVoice: boolean
    enableRecommendations: boolean
    enableImageAnalysis: boolean
    enableOfflineInference: boolean
  }
}

export const getAIConfig = (): AIConfig => {
  return {
    ollama: {
      baseUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama2',
      temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || '2048'),
      timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000')
    },
    whisper: {
      modelPath: process.env.WHISPER_MODEL_PATH || './models/whisper',
      modelSize: (process.env.WHISPER_MODEL_SIZE as any) || 'base',
      language: process.env.WHISPER_LANGUAGE || 'en',
      device: (process.env.WHISPER_DEVICE as any) || 'cpu'
    },
    coqui: {
      modelPath: process.env.COQUI_MODEL_PATH || './models/coqui',
      voiceModel: process.env.COQUI_VOICE_MODEL || 'tts_models/en/ljspeech/tacotron2-DDC',
      language: process.env.COQUI_LANGUAGE || 'en',
      speakingRate: parseFloat(process.env.COQUI_SPEAKING_RATE || '1.0'),
      pitch: parseFloat(process.env.COQUI_PITCH || '1.0')
    },
    chromadb: {
      host: process.env.CHROMADB_HOST || 'localhost',
      port: parseInt(process.env.CHROMADB_PORT || '8000'),
      collectionName: process.env.CHROMADB_COLLECTION || 'soilwise_knowledge',
      embeddingModel: process.env.CHROMADB_EMBEDDING_MODEL || 'sentence-transformers/all-MiniLM-L6-v2'
    },
    features: {
      enableVoice: process.env.ENABLE_VOICE === 'true',
      enableRecommendations: process.env.ENABLE_RECOMMENDATIONS !== 'false',
      enableImageAnalysis: process.env.ENABLE_IMAGE_ANALYSIS === 'true',
      enableOfflineInference: process.env.ENABLE_OFFLINE_INFERENCE !== 'false'
    }
  }
}

export interface CameraConfig {
  devices: Array<{
    id: string
    name: string
    resolution: string
    fps: number
    format: string
  }>
  capture: {
    autoFocus: boolean
    autoWhiteBalance: boolean
    exposure: number
    quality: number
  }
  processing: {
    enableObjectDetection: boolean
    enablePlantDisease: boolean
    enableCropAnalysis: boolean
    modelPath: string
  }
}

export const getCameraConfig = (): CameraConfig => {
  return {
    devices: JSON.parse(process.env.CAMERA_DEVICES || '[]'),
    capture: {
      autoFocus: process.env.CAMERA_AUTO_FOCUS !== 'false',
      autoWhiteBalance: process.env.CAMERA_AUTO_WB !== 'false',
      exposure: parseInt(process.env.CAMERA_EXPOSURE || '0'),
      quality: parseInt(process.env.CAMERA_QUALITY || '85')
    },
    processing: {
      enableObjectDetection: process.env.ENABLE_OBJECT_DETECTION === 'true',
      enablePlantDisease: process.env.ENABLE_PLANT_DISEASE === 'true',
      enableCropAnalysis: process.env.ENABLE_CROP_ANALYSIS === 'true',
      modelPath: process.env.VISION_MODEL_PATH || './models/vision'
    }
  }
}
