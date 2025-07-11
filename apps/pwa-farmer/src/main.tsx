import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// PWA registration
import { registerSW } from 'virtual:pwa-register'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Register service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update available notification
    if (confirm('New version available! Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Remove loading screen when React is ready
const removeLoadingScreen = () => {
  const loader = document.getElementById('initial-loader')
  if (loader) {
    loader.style.opacity = '0'
    setTimeout(() => loader.remove(), 300)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

// Remove loading screen after render
setTimeout(removeLoadingScreen, 100)
