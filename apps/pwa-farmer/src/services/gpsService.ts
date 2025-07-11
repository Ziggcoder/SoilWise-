interface LocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

interface LocationResult {
  lat: number
  lng: number
  accuracy?: number
  timestamp: Date
}

class GPSService {
  private isSupported = false
  private watchId: number | null = null

  constructor() {
    this.checkSupport()
  }

  private checkSupport(): void {
    // Check if running in Capacitor
    if ((window as any).Capacitor?.Plugins?.Geolocation) {
      this.isSupported = true
      return
    }

    // Check for web geolocation API
    this.isSupported = !!navigator.geolocation
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      // Test if we can get permission
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state !== 'denied'
    } catch {
      // Fallback - try to get position
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 1000 }
        )
      })
    }
  }

  async getCurrentLocation(options: LocationOptions = {}): Promise<LocationResult> {
    const {
      enableHighAccuracy = true,
      timeout = 10000,
      maximumAge = 300000 // 5 minutes
    } = options

    // Use Capacitor Geolocation plugin if available
    if ((window as any).Capacitor?.Plugins?.Geolocation) {
      return this.getLocationWithCapacitor(options)
    }

    // Fallback to web API
    return this.getLocationWithWebAPI(options)
  }

  private async getLocationWithCapacitor(options: LocationOptions): Promise<LocationResult> {
    try {
      const { Geolocation } = (window as any).Capacitor.Plugins

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy || true,
        timeout: options.timeout || 10000
      })

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp)
      }
    } catch (error) {
      throw new Error(`Location access failed: ${error}`)
    }
  }

  private async getLocationWithWebAPI(options: LocationOptions): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          })
        },
        (error) => {
          let message = 'Location access failed'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable'
              break
            case error.TIMEOUT:
              message = 'Location request timed out'
              break
          }
          reject(new Error(message))
        },
        {
          enableHighAccuracy: options.enableHighAccuracy || true,
          timeout: options.timeout || 10000,
          maximumAge: options.maximumAge || 300000
        }
      )
    })
  }

  async watchLocation(
    callback: (location: LocationResult) => void,
    errorCallback?: (error: Error) => void,
    options: LocationOptions = {}
  ): Promise<void> {
    // Clear existing watch
    if (this.watchId !== null) {
      this.clearWatch()
    }

    const {
      enableHighAccuracy = true,
      timeout = 10000,
      maximumAge = 300000
    } = options

    // Use Capacitor if available
    if ((window as any).Capacitor?.Plugins?.Geolocation) {
      return this.watchLocationWithCapacitor(callback, errorCallback, options)
    }

    // Web API
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        })
      },
      (error) => {
        let message = 'Location watching failed'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable'
            break
          case error.TIMEOUT:
            message = 'Location timeout'
            break
        }
        errorCallback?.(new Error(message))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    )
  }

  private async watchLocationWithCapacitor(
    callback: (location: LocationResult) => void,
    errorCallback?: (error: Error) => void,
    options: LocationOptions = {}
  ): Promise<void> {
    try {
      const { Geolocation } = (window as any).Capacitor.Plugins

      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options.enableHighAccuracy || true,
          timeout: options.timeout || 10000
        },
        (position: any) => {
          callback({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          })
        }
      )

      // Store the watch ID for cleanup
      this.watchId = watchId as number
    } catch (error) {
      errorCallback?.(new Error(`Location watching failed: ${error}`))
    }
  }

  clearWatch(): void {
    if (this.watchId !== null) {
      if ((window as any).Capacitor?.Plugins?.Geolocation) {
        (window as any).Capacitor.Plugins.Geolocation.clearWatch({ id: this.watchId })
      } else {
        navigator.geolocation.clearWatch(this.watchId)
      }
      this.watchId = null
    }
  }

  async requestPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    try {
      if ((window as any).Capacitor?.Plugins?.Geolocation) {
        const permission = await (window as any).Capacitor.Plugins.Geolocation.requestPermissions()
        return permission.location === 'granted' ? 'granted' : 'denied'
      }

      // Web API - try to get permission by requesting location
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state
    } catch {
      // Fallback - try to get position to trigger permission
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              resolve('denied')
            } else {
              resolve('prompt')
            }
          },
          { timeout: 1000 }
        )
      })
    }
  }
}

export const gpsService = new GPSService()
