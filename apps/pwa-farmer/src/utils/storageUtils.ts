/**
 * Storage utility functions for the PWA
 */

interface StorageItem<T = any> {
  value: T
  timestamp: number
  expiry?: number
}

class StorageUtils {
  // Local Storage with expiry
  setItem<T>(key: string, value: T, ttlMinutes?: number): void {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiry: ttlMinutes ? Date.now() + (ttlMinutes * 60 * 1000) : undefined
      }

      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.error('Failed to set localStorage item:', error)
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) return null

      const item: StorageItem<T> = JSON.parse(itemStr)
      
      // Check if expired
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key)
        return null
      }

      return item.value
    } catch (error) {
      console.error('Failed to get localStorage item:', error)
      return null
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove localStorage item:', error)
    }
  }

  // Session Storage
  setSessionItem<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to set sessionStorage item:', error)
    }
  }

  getSessionItem<T>(key: string): T | null {
    try {
      const itemStr = sessionStorage.getItem(key)
      return itemStr ? JSON.parse(itemStr) : null
    } catch (error) {
      console.error('Failed to get sessionStorage item:', error)
      return null
    }
  }

  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove sessionStorage item:', error)
    }
  }

  // Cleanup expired items
  cleanupExpired(): void {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()

      for (const key of keys) {
        try {
          const itemStr = localStorage.getItem(key)
          if (!itemStr) continue

          const item: StorageItem = JSON.parse(itemStr)
          if (item.expiry && now > item.expiry) {
            localStorage.removeItem(key)
          }
        } catch {
          // Skip invalid items
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired items:', error)
    }
  }

  // Get storage usage info
  getStorageInfo(): {
    used: number
    total: number
    percentage: number
    itemCount: number
  } {
    try {
      let used = 0
      let itemCount = 0

      // Calculate localStorage usage
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0
          itemCount++
        }
      }

      // Rough estimate of storage limit (usually 5-10MB)
      const total = 5 * 1024 * 1024 // 5MB estimate
      const percentage = (used / total) * 100

      return { used, total, percentage, itemCount }
    } catch {
      return { used: 0, total: 0, percentage: 0, itemCount: 0 }
    }
  }

  // Clear all storage (except protected keys)
  clearAll(protectedKeys: string[] = ['authToken', 'userPreferences']): void {
    try {
      const keys = Object.keys(localStorage)
      
      for (const key of keys) {
        if (!protectedKeys.includes(key)) {
          localStorage.removeItem(key)
        }
      }

      sessionStorage.clear()
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  // Image/File storage utilities
  async storeFile(key: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        try {
          const result = reader.result as string
          this.setItem(key, {
            data: result,
            type: file.type,
            size: file.size,
            name: file.name,
            lastModified: file.lastModified
          })
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  getStoredFile(key: string): {
    data: string
    type: string
    size: number
    name: string
    lastModified: number
  } | null {
    return this.getItem(key)
  }

  // Batch operations
  setMultiple(items: Record<string, any>): void {
    Object.entries(items).forEach(([key, value]) => {
      this.setItem(key, value)
    })
  }

  getMultiple(keys: string[]): Record<string, any> {
    const result: Record<string, any> = {}
    keys.forEach(key => {
      result[key] = this.getItem(key)
    })
    return result
  }

  removeMultiple(keys: string[]): void {
    keys.forEach(key => this.removeItem(key))
  }
}

export const storageUtils = new StorageUtils()

// Auto cleanup on app load
if (typeof window !== 'undefined') {
  storageUtils.cleanupExpired()
}
