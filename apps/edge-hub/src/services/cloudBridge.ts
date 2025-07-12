import { EventEmitter } from 'events'
import axios, { AxiosInstance, AxiosError } from 'axios'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'

export interface CloudConfig {
  endpoint: string
  apiKey?: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  syncInterval: number
  batchSize: number
}

export interface CloudSyncStatus {
  lastSync: Date | null
  isOnline: boolean
  isSyncing: boolean
  pendingUploads: number
  failedUploads: number
  totalSynced: number
  lastError?: string
}

export interface SyncBatch {
  type: 'sensor_data' | 'alerts' | 'farms' | 'configurations'
  data: any[]
  timestamp: Date
}

export class CloudBridge extends EventEmitter {
  private database: LocalDatabase
  private config: CloudConfig
  private apiClient: AxiosInstance
  private status: CloudSyncStatus
  private syncInterval: NodeJS.Timeout | null = null
  private isRunning = false

  constructor(database: LocalDatabase, config?: Partial<CloudConfig>) {
    super()
    this.database = database

    this.config = {
      endpoint: process.env.CLOUD_SYNC_ENDPOINT || 'https://api.soilwise.com',
      apiKey: process.env.CLOUD_API_KEY || undefined,
      timeout: parseInt(process.env.CLOUD_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.CLOUD_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.CLOUD_RETRY_DELAY || '5000'),
      syncInterval: parseInt(process.env.CLOUD_SYNC_INTERVAL || '300000'), // 5 minutes
      batchSize: parseInt(process.env.CLOUD_BATCH_SIZE || '100'),
      ...config
    }

    this.apiClient = axios.create({
      baseURL: this.config.endpoint,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SoilWise-EdgeHub/1.0.0',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    })

    this.status = {
      lastSync: null,
      isOnline: false,
      isSyncing: false,
      pendingUploads: 0,
      failedUploads: 0,
      totalSynced: 0
    }

    this.setupInterceptors()
  }

  async start(): Promise<void> {
    try {
      this.isRunning = true
      await this.loadSyncStatus()
      await this.checkConnectivity()
      this.startPeriodicSync()
      
      logger.info('Cloud Bridge started')
    } catch (error) {
      logger.error('Failed to start Cloud Bridge:', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    await this.saveSyncStatus()
    logger.info('Cloud Bridge stopped')
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        logger.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`)
        this.status.isOnline = true
        return response
      },
      (error: AxiosError) => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          this.status.isOnline = false
          logger.warn('Cloud service offline')
        } else {
          logger.error('API Response Error:', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  private async checkConnectivity(): Promise<void> {
    try {
      const response = await this.apiClient.get('/health')
      this.status.isOnline = response.status === 200
      logger.info('Cloud connectivity verified')
    } catch (error) {
      this.status.isOnline = false
      logger.warn('Cloud service not reachable')
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.isRunning && !this.status.isSyncing) {
        try {
          await this.performSync()
        } catch (error) {
          logger.error('Periodic sync failed:', error)
        }
      }
    }, this.config.syncInterval)
  }

  async performSync(): Promise<void> {
    if (this.status.isSyncing) {
      logger.warn('Sync already in progress, skipping')
      return
    }

    if (!this.status.isOnline) {
      await this.checkConnectivity()
      if (!this.status.isOnline) {
        logger.debug('Skipping sync - cloud service offline')
        return
      }
    }

    this.status.isSyncing = true
    logger.info('Starting cloud sync')

    try {
      // Upload pending data
      await this.uploadSensorData()
      await this.uploadAlerts()
      await this.uploadFarmData()
      
      // Download updates
      await this.downloadConfigurations()
      await this.downloadUpdates()

      this.status.lastSync = new Date()
      logger.info('Cloud sync completed successfully')
      this.emit('sync_completed', this.status)
    } catch (error) {
      this.status.lastError = error instanceof Error ? error.message : 'Sync failed'
      logger.error('Cloud sync failed:', error)
      this.emit('sync_failed', error)
    } finally {
      this.status.isSyncing = false
      await this.saveSyncStatus()
    }
  }

  private async uploadSensorData(): Promise<void> {
    try {
      // Get unsynced sensor data
      const pendingData = await this.database.getUnsyncedSensorData(this.config.batchSize)
      
      if (pendingData.length === 0) {
        logger.debug('No pending sensor data to upload')
        return
      }

      // Process in batches
      for (let i = 0; i < pendingData.length; i += this.config.batchSize) {
        const batch = pendingData.slice(i, i + this.config.batchSize)
        
        try {
          await this.uploadBatch({
            type: 'sensor_data',
            data: batch,
            timestamp: new Date()
          })

          // Mark as synced
          const ids = batch.map(item => item.id).filter(id => id)
          await this.database.markSensorDataSynced(ids)
          
          this.status.totalSynced += batch.length
          logger.debug(`Uploaded ${batch.length} sensor readings`)
        } catch (error) {
          this.status.failedUploads += batch.length
          logger.error(`Failed to upload sensor data batch:`, error)
        }
      }
    } catch (error) {
      logger.error('Sensor data upload failed:', error)
      throw error
    }
  }

  private async uploadAlerts(): Promise<void> {
    try {
      const pendingAlerts = await this.database.getUnsyncedAlerts(this.config.batchSize)
      
      if (pendingAlerts.length === 0) {
        logger.debug('No pending alerts to upload')
        return
      }

      try {
        await this.uploadBatch({
          type: 'alerts',
          data: pendingAlerts,
          timestamp: new Date()
        })

        // Mark as synced
        const ids = pendingAlerts.map(alert => alert.id).filter(id => id)
        await this.database.markAlertsSynced(ids)
        
        this.status.totalSynced += pendingAlerts.length
        logger.debug(`Uploaded ${pendingAlerts.length} alerts`)
      } catch (error) {
        this.status.failedUploads += pendingAlerts.length
        logger.error('Failed to upload alerts:', error)
      }
    } catch (error) {
      logger.error('Alert upload failed:', error)
      throw error
    }
  }

  private async uploadFarmData(): Promise<void> {
    try {
      const pendingFarms = await this.database.getUnsyncedFarms(this.config.batchSize)
      
      if (pendingFarms.length === 0) {
        logger.debug('No pending farm data to upload')
        return
      }

      try {
        await this.uploadBatch({
          type: 'farms',
          data: pendingFarms,
          timestamp: new Date()
        })

        // Mark as synced
        const ids = pendingFarms.map(farm => farm.id).filter(id => id)
        await this.database.markFarmsSynced(ids)
        
        this.status.totalSynced += pendingFarms.length
        logger.debug(`Uploaded ${pendingFarms.length} farm records`)
      } catch (error) {
        this.status.failedUploads += pendingFarms.length
        logger.error('Failed to upload farm data:', error)
      }
    } catch (error) {
      logger.error('Farm data upload failed:', error)
      throw error
    }
  }

  private async uploadBatch(batch: SyncBatch): Promise<void> {
    const endpoint = this.getUploadEndpoint(batch.type)
    
    await this.retryOperation(async () => {
      const response = await this.apiClient.post(endpoint, {
        type: batch.type,
        data: batch.data,
        timestamp: batch.timestamp,
        source: 'edge-hub'
      })

      if (response.status !== 200) {
        throw new Error(`Upload failed with status: ${response.status}`)
      }

      return response.data
    })
  }

  private async downloadConfigurations(): Promise<void> {
    try {
      const response = await this.apiClient.get('/configurations', {
        params: {
          lastSync: this.status.lastSync?.toISOString(),
          source: 'edge-hub'
        }
      })

      if (response.data && response.data.configurations) {
        for (const config of response.data.configurations) {
          await this.database.setConfiguration(config.key, config.value)
        }
        
        logger.debug(`Downloaded ${response.data.configurations.length} configurations`)
      }
    } catch (error) {
      logger.error('Configuration download failed:', error)
    }
  }

  private async downloadUpdates(): Promise<void> {
    try {
      const response = await this.apiClient.get('/updates', {
        params: {
          lastSync: this.status.lastSync?.toISOString(),
          source: 'edge-hub'
        }
      })

      if (response.data && response.data.updates) {
        // Process different types of updates
        for (const update of response.data.updates) {
          await this.processUpdate(update)
        }
        
        logger.debug(`Processed ${response.data.updates.length} updates`)
      }
    } catch (error) {
      logger.error('Updates download failed:', error)
    }
  }

  private async processUpdate(update: any): Promise<void> {
    switch (update.type) {
      case 'firmware':
        this.emit('firmware_update', update)
        break
      case 'configuration':
        await this.database.setConfiguration(update.key, update.value)
        break
      case 'device_command':
        this.emit('device_command', update)
        break
      default:
        logger.warn(`Unknown update type: ${update.type}`)
    }
  }

  private getUploadEndpoint(type: string): string {
    const endpoints = {
      sensor_data: '/sync/sensor-data',
      alerts: '/sync/alerts',
      farms: '/sync/farms',
      configurations: '/sync/configurations'
    }
    
    return endpoints[type as keyof typeof endpoints] || '/sync/data'
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        if (attempt < this.config.retryAttempts) {
          logger.debug(`Attempt ${attempt} failed, retrying in ${this.config.retryDelay}ms`)
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
        }
      }
    }

    throw lastError!
  }

  private async loadSyncStatus(): Promise<void> {
    try {
      const saved = await this.database.getSyncStatus()
      if (saved) {
        this.status = { ...this.status, ...saved }
      }
    } catch (error) {
      logger.error('Failed to load sync status:', error)
    }
  }

  private async saveSyncStatus(): Promise<void> {
    try {
      await this.database.saveSyncStatus(this.status)
    } catch (error) {
      logger.error('Failed to save sync status:', error)
    }
  }

  // Public API methods
  async forcefulSync(): Promise<void> {
    logger.info('Manual sync triggered')
    await this.performSync()
  }

  async testConnectivity(): Promise<boolean> {
    await this.checkConnectivity()
    return this.status.isOnline
  }

  getStatus(): CloudSyncStatus {
    return { ...this.status }
  }

  async sendAlert(alert: any): Promise<void> {
    if (!this.status.isOnline) {
      throw new Error('Cloud service offline')
    }

    try {
      await this.apiClient.post('/alerts', alert)
      logger.info(`Alert sent to cloud: ${alert.type}`)
    } catch (error) {
      logger.error('Failed to send alert:', error)
      throw error
    }
  }

  async getConfiguration(key: string): Promise<any> {
    if (!this.status.isOnline) {
      return await this.database.getConfiguration(key)
    }

    try {
      const response = await this.apiClient.get(`/configurations/${key}`)
      return response.data.value
    } catch (error) {
      logger.warn(`Failed to get configuration from cloud, using local: ${key}`)
      return await this.database.getConfiguration(key)
    }
  }

  async updateConfiguration(key: string, value: any): Promise<void> {
    // Update locally first
    await this.database.setConfiguration(key, value)

    // Try to update cloud
    if (this.status.isOnline) {
      try {
        await this.apiClient.put(`/configurations/${key}`, { value })
        logger.info(`Configuration updated in cloud: ${key}`)
      } catch (error) {
        logger.warn(`Failed to update configuration in cloud: ${key}`)
        // Will be synced in next sync cycle
      }
    }
  }
}
