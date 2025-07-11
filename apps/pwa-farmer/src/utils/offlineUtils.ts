/**
 * Utility functions for offline functionality
 */

export const isOnline = (): boolean => {
  return navigator.onLine
}

export const getNetworkType = (): string => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection

  return connection?.effectiveType || 'unknown'
}

export const isSlowConnection = (): boolean => {
  const networkType = getNetworkType()
  return ['slow-2g', '2g'].includes(networkType)
}

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve()
      return
    }

    const handleOnline = () => {
      window.removeEventListener('online', handleOnline)
      resolve()
    }

    window.addEventListener('online', handleOnline)
  })
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries - 1) {
        break
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export const isStorageAvailable = (type: 'localStorage' | 'sessionStorage' | 'indexedDB'): boolean => {
  try {
    switch (type) {
      case 'localStorage':
      case 'sessionStorage':
        const storage = window[type]
        const test = '__storage_test__'
        storage.setItem(test, test)
        storage.removeItem(test)
        return true

      case 'indexedDB':
        return !!window.indexedDB

      default:
        return false
    }
  } catch {
    return false
  }
}

export const getStorageUsage = async (): Promise<{
  used: number
  quota: number
  percentage: number
}> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = quota > 0 ? (used / quota) * 100 : 0

      return { used, quota, percentage }
    } catch {
      return { used: 0, quota: 0, percentage: 0 }
    }
  }

  return { used: 0, quota: 0, percentage: 0 }
}

export const clearAppCache = async (): Promise<void> => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }

    // Clear local storage (keep auth tokens)
    const authToken = localStorage.getItem('authToken')
    localStorage.clear()
    if (authToken) {
      localStorage.setItem('authToken', authToken)
    }

    // Clear session storage
    sessionStorage.clear()

  } catch (error) {
    console.error('Failed to clear app cache:', error)
    throw error
  }
}

export const compressData = (data: any): string => {
  try {
    return JSON.stringify(data)
  } catch {
    return ''
  }
}

export const decompressData = <T = any>(compressedData: string): T | null => {
  try {
    return JSON.parse(compressedData)
  } catch {
    return null
  }
}

export const generateOfflineId = (): string => {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const isOfflineId = (id: string): boolean => {
  return typeof id === 'string' && id.startsWith('offline_')
}

export const scheduleBackgroundSync = (tag: string): void => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return (registration as any).sync.register(tag)
    }).catch((error) => {
      console.warn('Background sync registration failed:', error)
    })
  }
}
