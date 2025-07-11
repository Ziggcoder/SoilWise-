import { useState, useEffect } from 'react'
import { cameraService } from '@/services/cameraService'
import type { Photo } from '@/types'

interface CameraOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

export const useCamera = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSupport()
  }, [])

  const checkSupport = async () => {
    try {
      const supported = await cameraService.isAvailable()
      setIsSupported(supported)
    } catch (err) {
      setError('Camera check failed')
      setIsSupported(false)
    }
  }

  const capturePhoto = async (options: CameraOptions = {}): Promise<string | null> => {
    if (!isSupported) {
      setError('Camera not supported')
      return null
    }

    setIsCapturing(true)
    setError(null)

    try {
      const result = await cameraService.capturePhoto({
        quality: options.quality || 0.8,
        maxWidth: options.maxWidth || 1920,
        maxHeight: options.maxHeight || 1080,
        resultType: 'base64'
      })

      return result.imageData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera capture failed'
      setError(errorMessage)
      return null
    } finally {
      setIsCapturing(false)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return {
    isSupported,
    isCapturing,
    error,
    capturePhoto,
    requestPermission,
    checkSupport
  }
}
