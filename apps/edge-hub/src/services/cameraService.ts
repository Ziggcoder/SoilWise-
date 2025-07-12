import { EventEmitter } from 'events'
import { logger } from '../utils/logger'
import { getCameraConfig, CameraConfig } from '../config/ai'

export interface CaptureOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png'
  deviceId?: string
}

export interface CaptureResult {
  id: string
  deviceId: string
  imageData: Buffer
  metadata: {
    timestamp: Date
    width: number
    height: number
    format: string
    size: number
    location?: {
      lat: number
      lng: number
    }
  }
  analysis?: {
    objects: Array<{
      label: string
      confidence: number
      bbox: [number, number, number, number]
    }>
    diseases: Array<{
      type: string
      confidence: number
      severity: 'low' | 'medium' | 'high'
    }>
    cropHealth: {
      overall: number
      leafColor: string
      growthStage: string
    }
  }
}

export class CameraService extends EventEmitter {
  private config: CameraConfig
  private devices: Map<string, any> = new Map()
  private isInitialized = false
  private captureQueue: Array<() => Promise<void>> = []
  private processingQueue = false

  constructor() {
    super()
    this.config = getCameraConfig()
  }

  async initialize(): Promise<void> {
    try {
      await this.detectCameras()
      await this.initializeDevices()
      await this.loadVisionModels()
      
      this.isInitialized = true
      logger.info('Camera service initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize camera service:', error)
      throw error
    }
  }

  private async detectCameras(): Promise<void> {
    try {
      // For Raspberry Pi, detect USB cameras and CSI camera
      const detectedDevices = []
      
      // Check for CSI camera (Raspberry Pi camera module)
      try {
        // This would use raspberry pi specific camera detection
        detectedDevices.push({
          id: 'csi-0',
          name: 'Raspberry Pi Camera',
          type: 'csi',
          path: '/dev/video0'
        })
      } catch (error) {
        logger.debug('No CSI camera detected')
      }

      // Check for USB cameras
      try {
        // This would scan /dev/video* devices
        for (let i = 0; i < 4; i++) {
          const devicePath = `/dev/video${i}`
          // Check if device exists and is accessible
          detectedDevices.push({
            id: `usb-${i}`,
            name: `USB Camera ${i}`,
            type: 'usb',
            path: devicePath
          })
        }
      } catch (error) {
        logger.debug('USB camera detection failed:', error)
      }

      logger.info(`Detected ${detectedDevices.length} camera devices`)
    } catch (error) {
      logger.error('Camera detection failed:', error)
    }
  }

  private async initializeDevices(): Promise<void> {
    // Initialize camera devices based on configuration
    for (const deviceConfig of this.config.devices) {
      try {
        const device = await this.initializeDevice(deviceConfig)
        this.devices.set(deviceConfig.id, device)
        logger.info(`Camera device ${deviceConfig.id} initialized`)
      } catch (error) {
        logger.error(`Failed to initialize camera device ${deviceConfig.id}:`, error)
      }
    }
  }

  private async initializeDevice(config: any): Promise<any> {
    // This would initialize specific camera device
    // For now, return a mock device
    return {
      id: config.id,
      name: config.name,
      isActive: false,
      capture: async (options: CaptureOptions) => {
        return await this.captureFromDevice(config.id, options)
      }
    }
  }

  private async loadVisionModels(): Promise<void> {
    if (!this.config.processing.enableObjectDetection && 
        !this.config.processing.enablePlantDisease && 
        !this.config.processing.enableCropAnalysis) {
      logger.info('Vision processing disabled, skipping model loading')
      return
    }

    try {
      // Load TensorFlow Lite models for edge inference
      logger.info('Loading vision models...')
      
      // This would load actual TensorFlow Lite or ONNX models
      // For plant disease detection, crop analysis, etc.
      
      logger.info('Vision models loaded successfully')
    } catch (error) {
      logger.error('Failed to load vision models:', error)
    }
  }

  async capturePhoto(options: CaptureOptions = {}): Promise<CaptureResult> {
    if (!this.isInitialized) {
      throw new Error('Camera service not initialized')
    }

    const deviceId = options.deviceId || this.getDefaultDevice()
    const device = this.devices.get(deviceId)
    
    if (!device) {
      throw new Error(`Camera device ${deviceId} not found`)
    }

    return new Promise((resolve, reject) => {
      this.captureQueue.push(async () => {
        try {
          const result = await this.performCapture(deviceId, options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async performCapture(deviceId: string, options: CaptureOptions): Promise<CaptureResult> {
    const captureId = `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      logger.info(`Starting photo capture on device ${deviceId}`)
      
      // Simulate camera capture (replace with actual camera API)
      const imageData = await this.captureFromDevice(deviceId, options)
      
      const result: CaptureResult = {
        id: captureId,
        deviceId,
        imageData,
        metadata: {
          timestamp: new Date(),
          width: options.width || 1920,
          height: options.height || 1080,
          format: options.format || 'jpeg',
          size: imageData.length
        }
      }

      // Perform image analysis if enabled
      if (this.shouldAnalyzeImage()) {
        result.analysis = await this.analyzeImage(imageData)
      }

      this.emit('photo_captured', result)
      logger.info(`Photo captured successfully: ${captureId}`)
      
      return result
    } catch (error) {
      logger.error(`Photo capture failed: ${error}`)
      throw error
    }
  }

  private async captureFromDevice(deviceId: string, options: CaptureOptions): Promise<Buffer> {
    // This would interface with actual camera hardware
    // For Raspberry Pi: use raspistill command or V4L2 API
    // For USB cameras: use V4L2 or OpenCV
    
    // Mock implementation - replace with actual camera capture
    const mockImageData = Buffer.alloc(1024 * 100) // 100KB mock image
    mockImageData.fill(0xFF) // Fill with white pixels
    
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate capture delay
    
    return mockImageData
  }

  private shouldAnalyzeImage(): boolean {
    return this.config.processing.enableObjectDetection ||
           this.config.processing.enablePlantDisease ||
           this.config.processing.enableCropAnalysis
  }

  private async analyzeImage(imageData: Buffer): Promise<any> {
    try {
      const analysis: any = {}

      if (this.config.processing.enableObjectDetection) {
        analysis.objects = await this.detectObjects(imageData)
      }

      if (this.config.processing.enablePlantDisease) {
        analysis.diseases = await this.detectDiseases(imageData)
      }

      if (this.config.processing.enableCropAnalysis) {
        analysis.cropHealth = await this.analyzeCropHealth(imageData)
      }

      return analysis
    } catch (error) {
      logger.error('Image analysis failed:', error)
      return null
    }
  }

  private async detectObjects(imageData: Buffer): Promise<any[]> {
    // Mock object detection - replace with TensorFlow Lite inference
    return [
      {
        label: 'plant',
        confidence: 0.95,
        bbox: [100, 100, 200, 200]
      },
      {
        label: 'leaf',
        confidence: 0.87,
        bbox: [120, 120, 180, 180]
      }
    ]
  }

  private async detectDiseases(imageData: Buffer): Promise<any[]> {
    // Mock disease detection - replace with specialized plant disease model
    return [
      {
        type: 'leaf_spot',
        confidence: 0.23,
        severity: 'low' as const
      }
    ]
  }

  private async analyzeCropHealth(imageData: Buffer): Promise<any> {
    // Mock crop health analysis - replace with crop-specific models
    return {
      overall: 0.85,
      leafColor: 'healthy_green',
      growthStage: 'vegetative'
    }
  }

  private getDefaultDevice(): string {
    const deviceIds = Array.from(this.devices.keys())
    return deviceIds.length > 0 ? deviceIds[0]! : ''
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.captureQueue.length === 0) {
      return
    }

    this.processingQueue = true

    while (this.captureQueue.length > 0) {
      const capture = this.captureQueue.shift()
      if (capture) {
        try {
          await capture()
        } catch (error) {
          logger.error('Capture queue processing error:', error)
        }
      }
    }

    this.processingQueue = false
  }

  async getDevices(): Promise<Array<{id: string, name: string, status: string}>> {
    const devices = []
    for (const [id, device] of this.devices) {
      devices.push({
        id,
        name: device.name,
        status: device.isActive ? 'active' : 'inactive'
      })
    }
    return devices
  }

  async testDevice(deviceId: string): Promise<boolean> {
    try {
      const device = this.devices.get(deviceId)
      if (!device) return false

      // Perform a test capture
      await this.captureFromDevice(deviceId, { width: 640, height: 480 })
      return true
    } catch (error) {
      logger.error(`Device test failed for ${deviceId}:`, error)
      return false
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Stop all active captures
      this.captureQueue.length = 0
      
      // Close device connections
      for (const [id, device] of this.devices) {
        try {
          if (device.close) {
            await device.close()
          }
        } catch (error) {
          logger.error(`Error closing device ${id}:`, error)
        }
      }

      this.devices.clear()
      this.isInitialized = false
      
      logger.info('Camera service cleaned up')
    } catch (error) {
      logger.error('Camera service cleanup error:', error)
    }
  }
}
