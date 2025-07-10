import axios from 'axios'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'

export interface SyncConfig {
  cloudEndpoint: string
  apiKey?: string
  syncInterval: number
  batchSize: number
  retryAttempts: number
  retryDelay: number
}

export interface SyncStatus {
  lastSync: Date | null
  isSync: boolean
  pendingItems: number
  failedItems: number
  totalSynced: number
}

export class SyncService {
  private database: LocalDatabase
  private config: SyncConfig
  private status: SyncStatus
  private syncInterval: NodeJS.Timeout | null = null
  private isRunning = false
  public isOnline = false

  constructor(database: LocalDatabase, config?: Partial<SyncConfig>) {
    this.database = database
    this.config = {
      cloudEndpoint: process.env.CLOUD_SYNC_ENDPOINT || 'https://api.soilwise.com',
      apiKey: process.env.CLOUD_API_KEY || undefined,
      syncInterval: 300000, // 5 minutes
      batchSize: 100,
      retryAttempts: 3,
      retryDelay: 5000,
      ...config
    }

    this.status = {
      lastSync: null,
      isSync: false,
      pendingItems: 0,
      failedItems: 0,
      totalSynced: 0
    }
  }

  async start(): Promise<void> {
    try {
      this.isRunning = true
      await this.loadSyncStatus()
      await this.performInitialSync()
      this.startPeriodicSync()
      
      logger.info('Sync Service started successfully')
    } catch (error) {
      logger.error('Failed to start Sync Service:', error)
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
    logger.info('Sync Service stopped')
  }

  async performSync(): Promise<void> {
    if (this.status.isSync) {
      logger.warn('Sync already in progress, skipping')
      return
    }

    try {
      this.status.isSync = true
      logger.info('Starting sync operation')

      // Sync different data types
      await this.syncSensorData()
      await this.syncAlerts()
      await this.syncFarmData()
      await this.syncConfigurations()

      this.status.lastSync = new Date()
      logger.info('Sync operation completed successfully')
    } catch (error) {
      logger.error('Sync operation failed:', error)
      throw error
    } finally {
      this.status.isSync = false
      await this.saveSyncStatus()
    }
  }

  private async performInitialSync(): Promise<void> {
    logger.info('Performing initial sync')
    
    try {
      // Download latest configurations
      await this.downloadConfigurations()
      
      // Upload any pending data
      await this.performSync()
      
      logger.info('Initial sync completed')
    } catch (error) {
      logger.error('Initial sync failed:', error)
      // Continue anyway, will retry on next sync
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      if (this.isRunning) {
        try {
          await this.performSync()
        } catch (error) {
          logger.error('Periodic sync failed:', error)
        }
      }
    }, this.config.syncInterval)

    logger.info(`Periodic sync started with interval: ${this.config.syncInterval}ms`)
  }

  private async syncSensorData(): Promise<void> {
    try {
      const unsyncedData = await this.database.getUnsyncedSensorData(this.config.batchSize)
      
      if (unsyncedData.length === 0) {
        logger.debug('No unsynced sensor data found')
        return
      }

      logger.info(`Syncing ${unsyncedData.length} sensor data records`)

      const batches = this.createBatches(unsyncedData, this.config.batchSize)
      
      for (const batch of batches) {
        await this.uploadSensorDataBatch(batch)
      }

      logger.info(`Successfully synced ${unsyncedData.length} sensor data records`)
    } catch (error) {
      logger.error('Failed to sync sensor data:', error)
      throw error
    }
  }

  private async syncAlerts(): Promise<void> {
    try {
      const unsyncedAlerts = await this.database.getUnsyncedAlerts(this.config.batchSize)
      
      if (unsyncedAlerts.length === 0) {
        logger.debug('No unsynced alerts found')
        return
      }

      logger.info(`Syncing ${unsyncedAlerts.length} alerts`)

      const batches = this.createBatches(unsyncedAlerts, this.config.batchSize)
      
      for (const batch of batches) {
        await this.uploadAlertsBatch(batch)
      }

      logger.info(`Successfully synced ${unsyncedAlerts.length} alerts`)
    } catch (error) {
      logger.error('Failed to sync alerts:', error)
      throw error
    }
  }

  private async syncFarmData(): Promise<void> {
    try {
      const unsyncedFarms = await this.database.getUnsyncedFarms(this.config.batchSize)
      
      if (unsyncedFarms.length === 0) {
        logger.debug('No unsynced farm data found')
        return
      }

      logger.info(`Syncing ${unsyncedFarms.length} farm records`)

      const batches = this.createBatches(unsyncedFarms, this.config.batchSize)
      
      for (const batch of batches) {
        await this.uploadFarmDataBatch(batch)
      }

      logger.info(`Successfully synced ${unsyncedFarms.length} farm records`)
    } catch (error) {
      logger.error('Failed to sync farm data:', error)
      throw error
    }
  }

  private async syncConfigurations(): Promise<void> {
    try {
      logger.info('Syncing configurations')
      await this.downloadConfigurations()
      logger.info('Configurations synced successfully')
    } catch (error) {
      logger.error('Failed to sync configurations:', error)
      throw error
    }
  }

  private async uploadSensorDataBatch(batch: any[]): Promise<void> {
    const response = await this.makeRequest('/sync/sensor-data', {
      method: 'POST',
      data: { records: batch }
    })

    if (response.success) {
      // Mark records as synced
      const ids = batch.map(record => record.id)
      await this.database.markSensorDataSynced(ids)
      this.status.totalSynced += batch.length
    } else {
      throw new Error(`Failed to upload sensor data batch: ${response.error}`)
    }
  }

  private async uploadAlertsBatch(batch: any[]): Promise<void> {
    const response = await this.makeRequest('/sync/alerts', {
      method: 'POST',
      data: { records: batch }
    })

    if (response.success) {
      // Mark records as synced
      const ids = batch.map(record => record.id)
      await this.database.markAlertsSynced(ids)
      this.status.totalSynced += batch.length
    } else {
      throw new Error(`Failed to upload alerts batch: ${response.error}`)
    }
  }

  private async uploadFarmDataBatch(batch: any[]): Promise<void> {
    const response = await this.makeRequest('/sync/farms', {
      method: 'POST',
      data: { records: batch }
    })

    if (response.success) {
      // Mark records as synced
      const ids = batch.map(record => record.id)
      await this.database.markFarmsSynced(ids)
      this.status.totalSynced += batch.length
    } else {
      throw new Error(`Failed to upload farm data batch: ${response.error}`)
    }
  }

  private async downloadConfigurations(): Promise<void> {
    const response = await this.makeRequest('/sync/configurations', {
      method: 'GET'
    })

    if (response.success && response.data) {
      await this.database.updateConfigurations(response.data)
    } else {
      throw new Error(`Failed to download configurations: ${response.error}`)
    }
  }

  private async makeRequest(endpoint: string, options: any): Promise<any> {
    const url = `${this.config.cloudEndpoint}${endpoint}`
    const headers: any = {
      'Content-Type': 'application/json',
      'User-Agent': 'SoilWise-EdgeHub/1.0'
    }

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }

    let attempt = 0
    let lastError: Error | null = null

    while (attempt < this.config.retryAttempts) {
      try {
        const response = await axios({
          method: options.method || 'GET',
          url,
          headers,
          data: options.data,
          timeout: 30000
        })

        return {
          success: true,
          data: response.data,
          status: response.status
        }
      } catch (error) {
        lastError = error as Error
        attempt++
        
        if (attempt < this.config.retryAttempts) {
          logger.warn(`Request failed, retrying in ${this.config.retryDelay}ms (attempt ${attempt}/${this.config.retryAttempts})`)
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay))
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error'
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private async loadSyncStatus(): Promise<void> {
    try {
      const status = await this.database.getSyncStatus()
      if (status) {
        this.status = {
          ...this.status,
          ...status,
          lastSync: status.lastSync ? new Date(status.lastSync) : null
        }
      }
    } catch (error) {
      logger.error('Failed to load sync status:', error)
      // Continue with default status
    }
  }

  private async saveSyncStatus(): Promise<void> {
    try {
      await this.database.saveSyncStatus(this.status)
    } catch (error) {
      logger.error('Failed to save sync status:', error)
    }
  }

  async forceSyncNow(): Promise<void> {
    logger.info('Force sync requested')
    await this.performSync()
  }

  getSyncStatus(): SyncStatus {
    return { ...this.status }
  }

  async updateSyncConfig(config: Partial<SyncConfig>): Promise<void> {
    this.config = { ...this.config, ...config }
    
    // Restart periodic sync with new interval if changed
    if (config.syncInterval && this.syncInterval) {
      clearInterval(this.syncInterval)
      this.startPeriodicSync()
    }
    
    logger.info('Sync configuration updated')
  }

  get running(): boolean {
    return this.isRunning
  }
}
