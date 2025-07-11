export * from './field'
export * from './sensor'
export * from './photo'
export * from './note'
export * from './sync'
export * from './user'

// Common types
export interface Location {
  lat: number
  lng: number
  address?: string
  accuracy?: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface DatabaseRecord {
  id?: number
  createdAt?: Date
  updatedAt?: Date
  syncStatus: 'pending' | 'synced' | 'conflict'
}

// PWA specific types
export interface PWAUpdate {
  updateAvailable: boolean
  waiting: boolean
  skipWaiting: () => void
  reload: () => void
  installUpdate: () => void
}

export interface NetworkStatus {
  online: boolean
  type?: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
}

export interface DeviceInfo {
  platform: string
  model?: string
  version?: string
  manufacturer?: string
  isVirtual?: boolean
  webViewVersion?: string
}

export interface Permission {
  name: 'camera' | 'geolocation' | 'microphone' | 'notifications' | 'storage'
  status: 'granted' | 'denied' | 'prompt' | 'unknown'
}
