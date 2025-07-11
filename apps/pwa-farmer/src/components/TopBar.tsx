import React from 'react'
import { Bell, Wifi, WifiOff, User } from 'lucide-react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useOfflineSync } from '@/hooks/useOfflineSync'

const TopBar: React.FC = () => {
  const { isOnline } = useNetworkStatus()
  const { syncStatus } = useOfflineSync()

  return (
    <div className="bg-white border-b border-neutral-200 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SW</span>
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">SoilWise</h1>
        </div>

        {/* Status indicators */}
        <div className="flex items-center space-x-3">
          {/* Sync status */}
          {syncStatus.isSyncing && (
            <div className="flex items-center space-x-1 text-primary-600">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
              <span className="text-xs">Syncing...</span>
            </div>
          )}

          {/* Pending items indicator */}
          {syncStatus.pendingItems > 0 && !syncStatus.isSyncing && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
              <span className="text-xs">{syncStatus.pendingItems} pending</span>
            </div>
          )}

          {/* Network status */}
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-1 text-neutral-600 hover:text-neutral-900 touch-target">
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <button className="p-1 text-neutral-600 hover:text-neutral-900 touch-target">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TopBar
