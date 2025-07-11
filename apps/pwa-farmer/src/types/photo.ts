export interface Photo {
  id?: number
  fieldId: number
  imageData: string
  thumbnail?: string
  caption: string
  timestamp: Date
  location?: {
    lat: number
    lng: number
  }
  tags: string[]
  size: number
  syncStatus: 'pending' | 'synced' | 'conflict'
  compressionLevel?: number
}

export interface PhotoMetadata {
  width: number
  height: number
  fileSize: number
  format: string
  exif?: {
    camera?: string
    lens?: string
    iso?: number
    focalLength?: number
    aperture?: number
    shutterSpeed?: string
    timestamp?: Date
  }
}

export interface PhotoFilter {
  fieldId?: number
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
  syncStatus?: Photo['syncStatus']
}

export interface PhotoCompression {
  quality: number
  maxWidth: number
  maxHeight: number
  format: 'jpeg' | 'webp'
}
