import React from 'react'
import { useLocation } from 'react-router-dom'
import BottomNavigation from './BottomNavigation.tsx'
import TopBar from './TopBar.tsx'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  
  // Hide navigation on certain pages
  const hideNavigation = ['/login', '/onboarding'].includes(location.pathname)

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Top bar */}
      {!hideNavigation && <TopBar />}
      
      {/* Main content */}
      <main className="flex-1 overflow-auto safe-top safe-bottom">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </div>
      </main>
      
      {/* Bottom navigation */}
      {!hideNavigation && <BottomNavigation />}
    </div>
  )
}

export default Layout
