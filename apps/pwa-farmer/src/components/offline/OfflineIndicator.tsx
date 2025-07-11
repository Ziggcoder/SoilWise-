import React from 'react'
import { WifiOff } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

const OfflineIndicator: React.FC = () => {
  const { isOnline } = useNetworkStatus()

  if (isOnline) {
    return null
  }

  return (
    <div className="offline-indicator">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Data will sync when connection is restored.</span>
      </div>
    </div>
  )
}

export default OfflineIndicator
