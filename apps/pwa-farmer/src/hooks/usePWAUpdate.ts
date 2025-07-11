import { useState, useEffect } from 'react'
import type { PWAUpdate } from '@/types'

export const usePWAUpdate = (): PWAUpdate => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)
        
        // Check if there's a waiting service worker
        if (reg.waiting) {
          setWaiting(true)
          setUpdateAvailable(true)
        }

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaiting(true)
                setUpdateAvailable(true)
              }
            })
          }
        })
      })

      // Listen for controlled service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          window.location.reload()
        }
      })
    }
  }, [])

  const skipWaiting = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      setWaiting(false)
    }
  }

  const reload = () => {
    window.location.reload()
  }

  const installUpdate = () => {
    skipWaiting()
  }

  return {
    updateAvailable,
    waiting,
    skipWaiting,
    reload,
    installUpdate,
  }
}
