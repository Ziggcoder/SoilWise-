export interface Note {
  id?: number
  fieldId: number
  title: string
  content: string
  type: 'text' | 'voice' | 'checklist'
  audioData?: string
  transcript?: string
  timestamp: Date
  location?: {
    lat: number
    lng: number
  }
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  reminderDate?: Date
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface VoiceNote extends Note {
  type: 'voice'
  audioData: string
  transcript: string
  duration: number
  quality: 'good' | 'fair' | 'poor'
}

export interface ChecklistNote extends Note {
  type: 'checklist'
  items: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  completedAt?: Date
}

export interface AIAdvisory {
  id?: number
  fieldId: number
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'disease' | 'harvest' | 'weather'
  title: string
  description: string
  recommendation: string
  confidence: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
  validUntil?: Date
  sourceData: any
  acknowledged: boolean
  applied: boolean
  appliedAt?: Date
  feedback?: {
    rating: number
    comment?: string
    helpful: boolean
  }
}
