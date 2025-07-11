import React, { Suspense, useEffect, Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layout components
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorFallback from '@/components/ui/ErrorFallback'
import OfflineIndicator from '@/components/offline/OfflineIndicator'

// Simple Error Boundary
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false, error: null })} />
    }

    return this.props.children
  }
}

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const Fields = React.lazy(() => import('@/pages/Fields'))
const FieldDetail = React.lazy(() => import('@/pages/FieldDetail'))
const Sensors = React.lazy(() => import('@/pages/Sensors'))
const Photos = React.lazy(() => import('@/pages/Photos'))
const Notes = React.lazy(() => import('@/pages/Notes'))
const Tasks = React.lazy(() => import('@/pages/Tasks'))
const Sync = React.lazy(() => import('@/pages/Sync'))
const Settings = React.lazy(() => import('@/pages/Settings'))

// Hooks
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { usePWAUpdate } from '@/hooks/usePWAUpdate'

function App() {
  const { isOnline } = useNetworkStatus()
  const { startSync } = useOfflineSync()
  const { updateAvailable, installUpdate } = usePWAUpdate()

  // Start background sync when coming online
  useEffect(() => {
    if (isOnline) {
      startSync()
    }
  }, [isOnline, startSync])

  // Show update notification
  useEffect(() => {
    if (updateAvailable) {
      // You can customize this notification
      const shouldUpdate = window.confirm(
        'A new version of SoilWise is available! Would you like to update now?'
      )
      if (shouldUpdate) {
        installUpdate()
      }
    }
  }, [updateAvailable, installUpdate])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        {/* Offline indicator */}
        {!isOnline && <OfflineIndicator />}
        
        {/* Main app content */}
        <Layout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Default route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fields" element={<Fields />} />
              <Route path="/fields/:id" element={<FieldDetail />} />
              <Route path="/sensors" element={<Sensors />} />
              <Route path="/photos" element={<Photos />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/sync" element={<Sync />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </div>
    </ErrorBoundary>
  )
}

export default App
