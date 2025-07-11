export interface SensorReading {
  id?: number
  sensorId: string
  fieldId: number
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nutrients' | 'light'
  value: number
  unit: string
  timestamp: Date
  location?: {
    lat: number
    lng: number
  }
  quality: 'good' | 'fair' | 'poor'
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface Sensor {
  id: string
  name: string
  type: SensorReading['type']
  fieldId: number
  status: 'active' | 'inactive' | 'maintenance' | 'error'
  lastReading?: Date
  batteryLevel?: number
  firmware?: string
  location?: {
    lat: number
    lng: number
  }
  calibrationDate?: Date
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface SensorAlert {
  id?: number
  sensorId: string
  type: 'threshold' | 'offline' | 'battery_low' | 'calibration_due'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  acknowledged: boolean
  resolvedAt?: Date
}

export interface SensorThreshold {
  id?: number
  sensorId: string
  type: SensorReading['type']
  minValue?: number
  maxValue?: number
  enabled: boolean
}
