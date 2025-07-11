interface CameraOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  resultType?: 'base64' | 'uri'
  source?: 'camera' | 'photos'
}

interface CaptureResult {
  imageData: string
  format: string
  timestamp: Date
  location?: {
    lat: number
    lng: number
  }
}

class CameraService {
  private isSupported = false

  constructor() {
    this.checkSupport()
  }

  private checkSupport(): void {
    // Check if running in Capacitor
    if ((window as any).Capacitor) {
      this.isSupported = true
      return
    }

    // Check for web camera API
    this.isSupported = !!(
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia
    )
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch {
      return false
    }
  }

  async capturePhoto(options: CameraOptions = {}): Promise<CaptureResult> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
      resultType = 'base64',
      source = 'camera'
    } = options

    // Use Capacitor Camera plugin if available
    if ((window as any).Capacitor?.Plugins?.Camera) {
      return this.captureWithCapacitor(options)
    }

    // Fallback to web API
    return this.captureWithWebAPI(options)
  }

  private async captureWithCapacitor(options: CameraOptions): Promise<CaptureResult> {
    try {
      const { Camera } = (window as any).Capacitor.Plugins

      const image = await Camera.getPhoto({
        quality: (options.quality || 0.8) * 100,
        width: options.maxWidth || 1920,
        height: options.maxHeight || 1080,
        resultType: options.resultType === 'base64' ? 'base64' : 'uri',
        source: options.source === 'camera' ? 'camera' : 'photos',
        allowEditing: false,
        saveToGallery: false
      })

      // Get location if available
      let location: { lat: number; lng: number } | undefined
      try {
        const { Geolocation } = (window as any).Capacitor.Plugins
        const position = await Geolocation.getCurrentPosition()
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      } catch {
        // Location not available
      }

      return {
        imageData: options.resultType === 'base64' 
          ? `data:image/jpeg;base64,${image.base64String}`
          : image.webPath,
        format: image.format || 'jpeg',
        timestamp: new Date(),
        location
      }
    } catch (error) {
      throw new Error(`Camera capture failed: ${error}`)
    }
  }

  private async captureWithWebAPI(options: CameraOptions): Promise<CaptureResult> {
    return new Promise((resolve, reject) => {
      // Create file input for fallback
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) {
          reject(new Error('No file selected'))
          return
        }

        try {
          const compressed = await this.compressImage(file, options)
          const location = await this.getCurrentLocation()

          resolve({
            imageData: compressed,
            format: 'jpeg',
            timestamp: new Date(),
            location
          })
        } catch (error) {
          reject(error)
        }
      }

      input.onerror = () => {
        reject(new Error('File selection failed'))
      }

      input.click()
    })
  }

  private async compressImage(file: File, options: CameraOptions): Promise<string> {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080
    } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const maxSize = Math.min(maxWidth, maxHeight)

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressed = canvas.toDataURL('image/jpeg', quality)
        resolve(compressed)
      }

      img.onerror = () => {
        reject(new Error('Image processing failed'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  private async getCurrentLocation(): Promise<{ lat: number; lng: number } | undefined> {
    try {
      if ((window as any).Capacitor?.Plugins?.Geolocation) {
        const { Geolocation } = (window as any).Capacitor.Plugins
        const position = await Geolocation.getCurrentPosition()
        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      }

      // Web Geolocation API
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          () => {
            resolve(undefined)
          },
          { timeout: 5000 }
        )
      })
    } catch {
      return undefined
    }
  }
}

export const cameraService = new CameraService()
