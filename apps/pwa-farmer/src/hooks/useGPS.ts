import { useState, useEffect } from 'react'
import { gpsService } from '@/services/gpsService'
import type { Location } from '@/types'

interface GPSOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

export const useGPS = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')

  useEffect(() => {
    checkSupport()
    checkPermission()
  }, [])

  const checkSupport = async () => {
    try {
      const supported = await gpsService.isAvailable()
      setIsSupported(supported)
    } catch {
      setIsSupported(false)
    }
  }

  const checkPermission = async () => {
    try {
      const status = await gpsService.requestPermission()
      setPermission(status)
    } catch {
      setPermission('unknown')
    }
  }

  const getCurrentLocation = async (options: GPSOptions = {}): Promise<Location | null> => {
    if (!isSupported) {
      setError('GPS not supported')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await gpsService.getCurrentLocation({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000
      })

      const newLocation: Location = {
        lat: result.lat,
        lng: result.lng,
        accuracy: result.accuracy
      }

      setLocation(newLocation)
      return newLocation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location access failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const requestPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      const status = await gpsService.requestPermission()
      setPermission(status)
      return status
    } catch {
      setPermission('denied')
      return 'denied'
    }
  }

  const watchPosition = async (
    callback: (location: Location) => void,
    options: GPSOptions = {}
  ): Promise<void> => {
    if (!isSupported) {
      setError('GPS not supported')
      return
    }

    try {
      await gpsService.watchLocation(
        (result) => {
          const newLocation: Location = {
            lat: result.lat,
            lng: result.lng,
            accuracy: result.accuracy
          }
          setLocation(newLocation)
          callback(newLocation)
        },
        (err) => {
          setError(err.message)
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 300000
        }
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Location watching failed'
      setError(errorMessage)
    }
  }

  const clearWatch = () => {
    gpsService.clearWatch()
  }

  return {
    isSupported,
    isLoading,
    location,
    error,
    permission,
    getCurrentLocation,
    requestPermission,
    watchPosition,
    clearWatch,
    checkSupport
  }
}
