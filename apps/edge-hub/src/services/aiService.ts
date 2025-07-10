import axios from 'axios'
import { logger } from '../utils/logger'

export interface AIRequest {
  type: 'advisory' | 'prediction' | 'analysis'
  data: any
  context?: any
}

export interface AIResponse {
  success: boolean
  result?: any
  error?: string
  confidence?: number
  timestamp: Date
}

export class AIService {
  private baseUrl: string
  private apiKey: string | undefined
  private isConnected = false
  public isReady = false

  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8082'
    this.apiKey = process.env.AI_API_KEY
  }

  async initialize(): Promise<void> {
    try {
      await this.checkConnection()
      this.isReady = true
      logger.info('AI Service initialized successfully')
    } catch (error) {
      this.isReady = false
      logger.error('Failed to initialize AI Service:', error)
      throw error
    }
  }

  async checkConnection(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
        headers: this.getHeaders()
      })
      
      if (response.status === 200) {
        this.isConnected = true
        logger.info('AI Service connection established')
      } else {
        throw new Error(`AI Service returned status: ${response.status}`)
      }
    } catch (error) {
      this.isConnected = false
      logger.error('AI Service connection failed:', error)
      throw error
    }
  }

  async getAdvisory(sensorData: any[], farmData: any): Promise<AIResponse> {
    try {
      const request: AIRequest = {
        type: 'advisory',
        data: {
          sensors: sensorData,
          farm: farmData,
          timestamp: new Date()
        }
      }

      const response = await axios.post(
        `${this.baseUrl}/advisory`,
        request,
        {
          headers: this.getHeaders(),
          timeout: 30000
        }
      )

      return {
        success: true,
        result: response.data,
        confidence: response.data.confidence,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error getting advisory:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  async getPrediction(sensorData: any[], predictionType: string): Promise<AIResponse> {
    try {
      const request: AIRequest = {
        type: 'prediction',
        data: {
          sensors: sensorData,
          predictionType,
          timestamp: new Date()
        }
      }

      const response = await axios.post(
        `${this.baseUrl}/prediction`,
        request,
        {
          headers: this.getHeaders(),
          timeout: 30000
        }
      )

      return {
        success: true,
        result: response.data,
        confidence: response.data.confidence,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error getting prediction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  async analyzeData(data: any[], analysisType: string): Promise<AIResponse> {
    try {
      const request: AIRequest = {
        type: 'analysis',
        data: {
          dataset: data,
          analysisType,
          timestamp: new Date()
        }
      }

      const response = await axios.post(
        `${this.baseUrl}/analysis`,
        request,
        {
          headers: this.getHeaders(),
          timeout: 30000
        }
      )

      return {
        success: true,
        result: response.data,
        confidence: response.data.confidence,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error analyzing data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  async processVoiceQuery(audioData: Buffer, context?: any): Promise<AIResponse> {
    try {
      const formData = new FormData()
      formData.append('audio', new Blob([audioData]), 'audio.wav')
      if (context) {
        formData.append('context', JSON.stringify(context))
      }

      const response = await axios.post(
        `${this.baseUrl}/voice/process`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      )

      return {
        success: true,
        result: response.data,
        confidence: response.data.confidence,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error processing voice query:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  async generateReport(data: any[], reportType: string): Promise<AIResponse> {
    try {
      const request = {
        type: 'report',
        data: {
          dataset: data,
          reportType,
          timestamp: new Date()
        }
      }

      const response = await axios.post(
        `${this.baseUrl}/report`,
        request,
        {
          headers: this.getHeaders(),
          timeout: 60000
        }
      )

      return {
        success: true,
        result: response.data,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error generating report:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  async getCropRecommendations(soilData: any, weatherData: any): Promise<AIResponse> {
    try {
      const request = {
        type: 'crop_recommendation',
        data: {
          soil: soilData,
          weather: weatherData,
          timestamp: new Date()
        }
      }

      const response = await axios.post(
        `${this.baseUrl}/crop/recommend`,
        request,
        {
          headers: this.getHeaders(),
          timeout: 30000
        }
      )

      return {
        success: true,
        result: response.data,
        confidence: response.data.confidence,
        timestamp: new Date()
      }
    } catch (error) {
      logger.error('Error getting crop recommendations:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SoilWise-EdgeHub/1.0'
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  get connected(): boolean {
    return this.isConnected
  }

  async shutdown(): Promise<void> {
    this.isConnected = false
    this.isReady = false
    logger.info('AI Service shutdown')
  }

  async cleanup(): Promise<void> {
    await this.shutdown()
  }
}
