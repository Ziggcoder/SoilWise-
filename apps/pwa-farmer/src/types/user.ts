export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'farmer' | 'admin' | 'advisor'
  farmIds: number[]
  preferences: UserPreferences
  subscription: Subscription
  createdAt: Date
  lastLoginAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  units: 'metric' | 'imperial'
  notifications: NotificationSettings
  sync: SyncSettings
  camera: CameraSettings
  voice: VoiceSettings
}

export interface NotificationSettings {
  enabled: boolean
  push: boolean
  email: boolean
  sms: boolean
  alerts: boolean
  reminders: boolean
  updates: boolean
  quiet_hours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface SyncSettings {
  auto: boolean
  wifi_only: boolean
  background: boolean
  frequency: number
  batch_size: number
}

export interface CameraSettings {
  quality: 'low' | 'medium' | 'high'
  auto_location: boolean
  auto_timestamp: boolean
  compression: boolean
}

export interface VoiceSettings {
  enabled: boolean
  language: string
  wake_word: boolean
  auto_transcript: boolean
  noise_reduction: boolean
}

export interface Subscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended' | 'cancelled'
  startDate: Date
  endDate?: Date
  features: string[]
  limits: SubscriptionLimits
}

export interface SubscriptionLimits {
  fields: number
  sensors: number
  photos: number
  storage: number // MB
  ai_queries: number
}
