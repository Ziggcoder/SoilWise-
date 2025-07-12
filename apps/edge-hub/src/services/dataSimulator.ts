import { EventEmitter } from 'events'
import { logger } from '../utils/logger'

export interface SensorReading {
  sensor_id: string
  farm_id: string
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nitrogen' | 'phosphorus' | 'potassium'
  value: number
  unit: string
  timestamp: Date
  location: {
    lat: number
    lng: number
  }
  quality: 'high' | 'medium' | 'low'
  battery_level?: number
}

export interface SimulatedDevice {
  id: string
  name: string
  type: string
  location: { lat: number, lng: number }
  sensors: string[]
  isActive: boolean
  batteryLevel: number
  signalStrength: number
}

export class DataSimulator extends EventEmitter {
  private devices: Map<string, SimulatedDevice> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  constructor() {
    super()
    this.initializeDevices()
  }

  private initializeDevices(): void {
    // Farm 1 - Corn Field
    this.devices.set('device_001', {
      id: 'device_001',
      name: 'Corn Field North Sensor',
      type: 'soil_station',
      location: { lat: 40.7128, lng: -74.0060 },
      sensors: ['soil_moisture', 'temperature', 'ph', 'nitrogen'],
      isActive: true,
      batteryLevel: 85,
      signalStrength: 92
    })

    // Farm 1 - Weather Station
    this.devices.set('device_002', {
      id: 'device_002',
      name: 'Central Weather Station',
      type: 'weather_station',
      location: { lat: 40.7130, lng: -74.0058 },
      sensors: ['temperature', 'humidity'],
      isActive: true,
      batteryLevel: 78,
      signalStrength: 88
    })

    // Farm 2 - Tomato Greenhouse
    this.devices.set('device_003', {
      id: 'device_003',
      name: 'Greenhouse Soil Monitor',
      type: 'soil_station',
      location: { lat: 40.7125, lng: -74.0065 },
      sensors: ['soil_moisture', 'temperature', 'ph', 'phosphorus', 'potassium'],
      isActive: true,
      batteryLevel: 92,
      signalStrength: 95
    })

    // Farm 3 - Wheat Field
    this.devices.set('device_004', {
      id: 'device_004',
      name: 'Wheat Field East Sensor',
      type: 'soil_station',
      location: { lat: 40.7135, lng: -74.0055 },
      sensors: ['soil_moisture', 'temperature', 'ph'],
      isActive: true,
      batteryLevel: 65,
      signalStrength: 75
    })

    logger.info(`Initialized ${this.devices.size} simulated devices`)
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Data simulator already running')
      return
    }

    this.isRunning = true

    // Start data generation for each device
    this.devices.forEach((device, deviceId) => {
      if (device.isActive) {
        // Generate data every 30 seconds for active devices
        const interval = setInterval(() => {
          this.generateDeviceData(device)
        }, 30000)

        this.intervals.set(deviceId, interval)
      }
    })

    // Generate initial data burst
    this.devices.forEach(device => {
      if (device.isActive) {
        this.generateDeviceData(device)
      }
    })

    // Simulate alerts occasionally
    this.startAlertSimulation()

    logger.info('Data simulator started')
  }

  stop(): void {
    this.isRunning = false

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()

    logger.info('Data simulator stopped')
  }

  private generateDeviceData(device: SimulatedDevice): void {
    const farmId = this.getFarmIdFromDevice(device.id)

    device.sensors.forEach(sensorType => {
      const reading = this.generateSensorReading(device, sensorType, farmId)
      this.emit('sensor_data', reading)
    })

    // Occasionally update device status
    if (Math.random() < 0.1) {
      this.updateDeviceStatus(device)
      this.emit('device_status', {
        device_id: device.id,
        battery_level: device.batteryLevel,
        signal_strength: device.signalStrength,
        is_active: device.isActive,
        timestamp: new Date()
      })
    }
  }

  private generateSensorReading(device: SimulatedDevice, sensorType: string, farmId: string): SensorReading {
    const baseValues = this.getBaseValues(sensorType, farmId)
    const variation = this.getRealisticVariation(sensorType)
    const value = baseValues.value + (Math.random() - 0.5) * variation

    // Add some seasonal and daily patterns
    const now = new Date()
    const hour = now.getHours()
    const seasonalMultiplier = this.getSeasonalMultiplier(sensorType, now)
    const dailyMultiplier = this.getDailyMultiplier(sensorType, hour)

    const finalValue = Math.max(0, value * seasonalMultiplier * dailyMultiplier)

    return {
      sensor_id: `${device.id}_${sensorType}`,
      farm_id: farmId,
      type: sensorType as any,
      value: Math.round(finalValue * 100) / 100, // Round to 2 decimal places
      unit: baseValues.unit,
      timestamp: new Date(),
      location: {
        lat: device.location.lat + (Math.random() - 0.5) * 0.0001, // Small location variance
        lng: device.location.lng + (Math.random() - 0.5) * 0.0001
      },
      quality: this.getDataQuality(device.signalStrength),
      battery_level: device.batteryLevel
    }
  }

  private getBaseValues(sensorType: string, farmId: string): { value: number, unit: string } {
    const baseValues: { [key: string]: { value: number, unit: string } } = {
      soil_moisture: { value: 45, unit: '%' },
      temperature: { value: 22, unit: '°C' },
      humidity: { value: 60, unit: '%' },
      ph: { value: 6.5, unit: 'pH' },
      nitrogen: { value: 25, unit: 'ppm' },
      phosphorus: { value: 15, unit: 'ppm' },
      potassium: { value: 180, unit: 'ppm' }
    }

    // Adjust base values per farm type
    const farmAdjustments: { [farmId: string]: { [sensor: string]: number } } = {
      'farm_001': { // Corn field
        soil_moisture: 1.1,
        nitrogen: 1.2,
        ph: 0.95
      },
      'farm_002': { // Greenhouse tomatoes
        soil_moisture: 1.3,
        temperature: 1.15,
        humidity: 1.2,
        phosphorus: 1.4
      },
      'farm_003': { // Wheat field
        soil_moisture: 0.9,
        nitrogen: 0.8,
        potassium: 1.1
      }
    }

    const base = baseValues[sensorType] || { value: 50, unit: 'units' }
    const adjustment = farmAdjustments[farmId]?.[sensorType] || 1

    return {
      value: base.value * adjustment,
      unit: base.unit
    }
  }

  private getRealisticVariation(sensorType: string): number {
    const variations: { [key: string]: number } = {
      soil_moisture: 8,    // ±4%
      temperature: 6,      // ±3°C
      humidity: 15,        // ±7.5%
      ph: 0.8,            // ±0.4 pH
      nitrogen: 8,         // ±4 ppm
      phosphorus: 6,       // ±3 ppm
      potassium: 30        // ±15 ppm
    }

    return variations[sensorType] || 10
  }

  private getSeasonalMultiplier(sensorType: string, date: Date): number {
    const month = date.getMonth() + 1 // 1-12
    
    // Summer months (June-August) vs Winter months (Dec-Feb)
    const isSummer = month >= 6 && month <= 8
    const isWinter = month >= 12 || month <= 2

    const seasonalEffects: { [key: string]: { summer: number, winter: number } } = {
      temperature: { summer: 1.4, winter: 0.6 },
      humidity: { summer: 1.2, winter: 0.8 },
      soil_moisture: { summer: 0.8, winter: 1.1 },
      ph: { summer: 1.02, winter: 0.98 },
      nitrogen: { summer: 1.1, winter: 0.9 },
      phosphorus: { summer: 1.05, winter: 0.95 },
      potassium: { summer: 1.0, winter: 1.0 }
    }

    const effect = seasonalEffects[sensorType] || { summer: 1.0, winter: 1.0 }

    if (isSummer) return effect.summer
    if (isWinter) return effect.winter
    return 1.0 // Spring/Fall
  }

  private getDailyMultiplier(sensorType: string, hour: number): number {
    // Daily patterns (0-23 hour)
    const dailyEffects: { [key: string]: (hour: number) => number } = {
      temperature: (h) => 0.8 + 0.4 * Math.sin((h - 6) * Math.PI / 12), // Peak at 2 PM
      humidity: (h) => 1.2 - 0.4 * Math.sin((h - 6) * Math.PI / 12),    // Inverse of temperature
      soil_moisture: () => 1.0, // Stable throughout day
      ph: (h) => 1.0 + 0.05 * Math.sin(h * Math.PI / 12), // Slight daily variation
      nitrogen: () => 1.0,
      phosphorus: () => 1.0,
      potassium: () => 1.0
    }

    const effect = dailyEffects[sensorType]
    return effect ? effect(hour) : 1.0
  }

  private getDataQuality(signalStrength: number): 'high' | 'medium' | 'low' {
    if (signalStrength > 85) return 'high'
    if (signalStrength > 60) return 'medium'
    return 'low'
  }

  private updateDeviceStatus(device: SimulatedDevice): void {
    // Simulate battery drain
    device.batteryLevel = Math.max(10, device.batteryLevel - Math.random() * 2)

    // Simulate signal fluctuations
    device.signalStrength += (Math.random() - 0.5) * 10
    device.signalStrength = Math.max(30, Math.min(100, device.signalStrength))

    // Very rarely, a device goes offline
    if (Math.random() < 0.01) {
      device.isActive = false
      setTimeout(() => {
        device.isActive = true
        logger.info(`Device ${device.id} came back online`)
      }, 60000) // 1 minute offline
    }
  }

  private getFarmIdFromDevice(deviceId: string): string {
    const farmMapping: { [key: string]: string } = {
      'device_001': 'farm_001',
      'device_002': 'farm_001',
      'device_003': 'farm_002',
      'device_004': 'farm_003'
    }

    return farmMapping[deviceId] || 'farm_unknown'
  }

  private startAlertSimulation(): void {
    // Generate alerts occasionally
    const alertInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        this.generateAlert()
      }
    }, 60000) // Check every minute

    this.intervals.set('alerts', alertInterval)
  }

  private generateAlert(): void {
    const alertTypes = [
      { type: 'low_soil_moisture', severity: 'medium', message: 'Soil moisture below optimal range' },
      { type: 'high_temperature', severity: 'warning', message: 'Temperature exceeding recommended levels' },
      { type: 'ph_imbalance', severity: 'high', message: 'Soil pH outside optimal range' },
      { type: 'low_battery', severity: 'low', message: 'Device battery level low' },
      { type: 'connectivity_issue', severity: 'medium', message: 'Intermittent connectivity detected' },
      { type: 'nutrient_deficiency', severity: 'high', message: 'Nitrogen levels below recommended threshold' }
    ]

    const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const devices = Array.from(this.devices.keys())
    const randomDevice = devices[Math.floor(Math.random() * devices.length)]
    const deviceId = randomDevice || 'device_001'
    const farmId = this.getFarmIdFromDevice(deviceId)

    if (alert) {
      this.emit('alert', {
        id: `alert_${Date.now()}`,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        farm_id: farmId,
        sensor_id: deviceId,
        timestamp: new Date(),
        resolved: false,
        metadata: {
          automated: true,
          confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
        }
      })
    }
  }

  // Public methods for manual testing
  triggerAlert(type: string, farmId: string): void {
    this.emit('alert', {
      id: `manual_alert_${Date.now()}`,
      type,
      severity: 'high',
      message: `Manual test alert: ${type}`,
      farm_id: farmId,
      timestamp: new Date(),
      resolved: false,
      metadata: {
        automated: false,
        manual_trigger: true
      }
    })
  }

  getDeviceStatus(): SimulatedDevice[] {
    return Array.from(this.devices.values())
  }

  isActive(): boolean {
    return this.isRunning
  }
}
