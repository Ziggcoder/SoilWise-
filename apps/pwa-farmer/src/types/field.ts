export interface Field {
  id?: number
  farmId: number
  name: string
  size: number
  cropType: string
  plantingDate: Date
  harvestDate?: Date
  location: {
    lat: number
    lng: number
    polygon: Array<{lat: number, lng: number}>
  }
  soilType: string
  syncStatus: 'pending' | 'synced' | 'conflict'
  lastModified?: Date
  notes?: string
}

export interface FieldFormData {
  name: string
  size: number
  cropType: string
  plantingDate: string
  harvestDate?: string
  soilType: string
  notes?: string
}

export interface FieldMetrics {
  totalFields: number
  totalArea: number
  activeCrops: number
  avgFieldSize: number
}
