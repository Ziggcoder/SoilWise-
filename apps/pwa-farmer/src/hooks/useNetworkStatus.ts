import { useState, useEffect } from 'react'
import type { NetworkStatus } from '@/types'

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    type: 'unknown',
    effectiveType: '4g',
  })

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      setNetworkStatus({
        online: navigator.onLine,
        type: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      })
    }

    const handleOnline = () => {
      updateNetworkStatus()
    }

    const handleOffline = () => {
      setNetworkStatus(prev => ({ ...prev, online: false }))
    }

    const handleConnectionChange = () => {
      updateNetworkStatus()
    }

    // Initial status
    updateNetworkStatus()

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return {
    isOnline: networkStatus.online,
    networkType: networkStatus.type,
    effectiveType: networkStatus.effectiveType,
    downlink: networkStatus.downlink,
    rtt: networkStatus.rtt,
    networkStatus,
  }
}
