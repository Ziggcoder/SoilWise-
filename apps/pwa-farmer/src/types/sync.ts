export interface SyncItem {
  id?: number
  tableName: string
  recordId: number
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high'
  retryCount: number
  lastAttempt?: Date
  error?: string
  synced: boolean
}

export interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingItems: number
  failedItems: number
  totalItems: number
  progress: number
  errors: SyncError[]
}

export interface SyncError {
  id: string
  message: string
  timestamp: Date
  type: 'network' | 'server' | 'validation' | 'conflict'
  details?: any
}

export interface ConflictResolution {
  id: string
  tableName: string
  recordId: number
  localData: any
  serverData: any
  resolution: 'keep_local' | 'keep_server' | 'merge' | 'manual'
  resolvedAt?: Date
  resolvedBy?: string
}

export interface SyncConfig {
  autoSync: boolean
  syncInterval: number // minutes
  maxRetries: number
  batchSize: number
  wifiOnly: boolean
  backgroundSync: boolean
}
