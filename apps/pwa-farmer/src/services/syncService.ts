import { db } from '@/database'
import { apiService } from './apiService'
import type { SyncItem, SyncError } from '@/types'

interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: SyncError[]
}

class SyncService {
  public onProgress?: (progress: number, pendingItems: number) => void
  private isRunning = false

  async syncAll(): Promise<SyncResult> {
    if (this.isRunning) {
      throw new Error('Sync already in progress')
    }

    this.isRunning = true
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    }

    try {
      // Get all pending sync items
      const pendingData = await db.getPendingSync()
      const allItems = [
        ...pendingData.farms.map(item => ({ type: 'farms', data: item })),
        ...pendingData.fields.map(item => ({ type: 'fields', data: item })),
        ...pendingData.observations.map(item => ({ type: 'observations', data: item })),
        ...pendingData.sensorReadings.map(item => ({ type: 'sensorReadings', data: item })),
        ...pendingData.tasks.map(item => ({ type: 'tasks', data: item }))
      ]

      if (allItems.length === 0) {
        return result
      }

      // Sync items in batches
      const batchSize = 10
      for (let i = 0; i < allItems.length; i += batchSize) {
        const batch = allItems.slice(i, i + batchSize)
        
        try {
          await this.syncBatch(batch)
          result.synced += batch.length
        } catch (error) {
          result.failed += batch.length
          result.errors.push({
            id: Date.now().toString(),
            message: error instanceof Error ? error.message : 'Batch sync failed',
            timestamp: new Date(),
            type: 'server',
            details: error
          })
        }

        // Update progress
        const progress = Math.round(((i + batch.length) / allItems.length) * 100)
        const remaining = allItems.length - (i + batch.length)
        this.onProgress?.(progress, remaining)
      }

      // If there were failures, overall sync is not successful
      if (result.failed > 0) {
        result.success = false
      }

    } catch (error) {
      result.success = false
      result.errors.push({
        id: Date.now().toString(),
        message: error instanceof Error ? error.message : 'Sync failed',
        timestamp: new Date(),
        type: 'network',
        details: error
      })
    } finally {
      this.isRunning = false
    }

    return result
  }

  private async syncBatch(items: Array<{ type: string; data: any }>): Promise<void> {
    const promises = items.map(item => this.syncItem(item.type, item.data))
    await Promise.allSettled(promises)
  }

  private async syncItem(tableName: string, data: any): Promise<void> {
    try {
      // Determine the API endpoint based on table name
      const endpoint = this.getEndpointForTable(tableName)
      
      if (data.id && data.id > 0) {
        // Update existing record
        await apiService.put(`${endpoint}/${data.id}`, data)
      } else {
        // Create new record
        const response = await apiService.post(endpoint, data)
        // Update local record with server ID if needed
        if (response.data?.id && data.id) {
          await this.updateLocalRecord(tableName, data.id, { id: response.data.id })
        }
      }

      // Mark as synced
      await db.markSynced(tableName, [data.id])
      
    } catch (error) {
      console.error(`Failed to sync ${tableName} item:`, error)
      throw error
    }
  }

  private async updateLocalRecord(tableName: string, localId: number, updates: any): Promise<void> {
    const table = (db as any)[tableName]
    if (table) {
      await table.update(localId, updates)
    }
  }

  private getEndpointForTable(tableName: string): string {
    const endpointMap: Record<string, string> = {
      farms: '/api/farms',
      fields: '/api/fields',
      observations: '/api/observations',
      sensorReadings: '/api/sensor-readings',
      tasks: '/api/tasks'
    }

    return endpointMap[tableName] || `/api/${tableName}`
  }

  async syncTable(tableName: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: []
    }

    try {
      const pendingData = await db.getPendingSync()
      const items = (pendingData as any)[tableName] || []

      for (const item of items) {
        try {
          await this.syncItem(tableName, item)
          result.synced++
        } catch (error) {
          result.failed++
          result.errors.push({
            id: Date.now().toString(),
            message: error instanceof Error ? error.message : 'Item sync failed',
            timestamp: new Date(),
            type: 'server',
            details: error
          })
        }
      }

      if (result.failed > 0) {
        result.success = false
      }

    } catch (error) {
      result.success = false
      result.errors.push({
        id: Date.now().toString(),
        message: error instanceof Error ? error.message : 'Table sync failed',
        timestamp: new Date(),
        type: 'network',
        details: error
      })
    }

    return result
  }

  async downloadServerChanges(): Promise<void> {
    try {
      // This would typically fetch changes from server
      // and update local database
      const lastSync = localStorage.getItem('lastSyncTimestamp')
      const timestamp = lastSync ? new Date(lastSync) : new Date(0)
      
      // Fetch changes since last sync
      const changes = await apiService.get('/api/sync/changes', {
        params: { since: timestamp.toISOString() }
      })

      // Apply changes to local database
      if (changes.data) {
        await this.applyServerChanges(changes.data)
        localStorage.setItem('lastSyncTimestamp', new Date().toISOString())
      }

    } catch (error) {
      console.error('Failed to download server changes:', error)
      throw error
    }
  }

  private async applyServerChanges(changes: any): Promise<void> {
    // Apply server changes to local database
    // This would handle creates, updates, and deletes
    for (const [tableName, items] of Object.entries(changes)) {
      const table = (db as any)[tableName]
      if (table && Array.isArray(items)) {
        for (const item of items as any[]) {
          try {
            if (item._deleted) {
              await table.delete(item.id)
            } else {
              await table.put(item)
            }
          } catch (error) {
            console.error(`Failed to apply change to ${tableName}:`, error)
          }
        }
      }
    }
  }
}

export const syncService = new SyncService()
