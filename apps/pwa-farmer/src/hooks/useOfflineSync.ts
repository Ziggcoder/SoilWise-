import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { db } from '@/database'
import { syncService } from '@/services/syncService'
import type { SyncStatus } from '@/types'

export const useOfflineSync = () => {
  const queryClient = useQueryClient()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0,
    failedItems: 0,
    totalItems: 0,
    progress: 0,
    errors: [],
  })

  const syncMutation = useMutation({
    mutationFn: syncService.syncAll,
    onMutate: () => {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, progress: 0 }))
    },
    onSuccess: (result: any) => {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingItems: 0,
        progress: 100,
        errors: result?.errors || [],
      }))
      
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries()
    },
    onError: (error: any) => {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: [...prev.errors, {
          id: Date.now().toString(),
          message: error.message || 'Sync failed',
          timestamp: new Date(),
          type: 'network',
          details: error,
        }],
      }))
    },
  })

  const updateSyncProgress = useCallback((progress: number, pendingItems: number) => {
    setSyncStatus(prev => ({
      ...prev,
      progress,
      pendingItems,
    }))
  }, [])

  const getPendingItemsCount = useCallback(async () => {
    try {
      const pending = await db.getPendingSync()
      const count = Object.values(pending).reduce((total, items) => total + items.length, 0)
      
      setSyncStatus(prev => ({
        ...prev,
        pendingItems: count,
        totalItems: count,
      }))
      
      return count
    } catch (error) {
      console.error('Failed to get pending items count:', error)
      return 0
    }
  }, [])

  const startSync = useCallback(async () => {
    if (!navigator.onLine || syncStatus.isSyncing) {
      return
    }

    const pendingCount = await getPendingItemsCount()
    if (pendingCount > 0) {
      syncMutation.mutate()
    }
  }, [syncStatus.isSyncing, getPendingItemsCount, syncMutation])

  const clearErrors = useCallback(() => {
    setSyncStatus(prev => ({ ...prev, errors: [] }))
  }, [])

  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      startSync()
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial pending count
    getPendingItemsCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [startSync, getPendingItemsCount])

  // Setup sync service progress callback
  useEffect(() => {
    syncService.onProgress = updateSyncProgress
    return () => {
      syncService.onProgress = undefined
    }
  }, [updateSyncProgress])

  return {
    syncStatus,
    startSync,
    isLoading: syncMutation.isLoading,
    error: syncMutation.error,
    clearErrors,
    getPendingItemsCount,
  }
}
