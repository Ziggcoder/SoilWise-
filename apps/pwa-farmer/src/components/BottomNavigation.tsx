import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home, 
  MapPin, 
  Activity, 
  Camera, 
  FileText
} from 'lucide-react'

const navigationItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/fields', icon: MapPin, label: 'Fields' },
  { to: '/sensors', icon: Activity, label: 'Sensors' },
  { to: '/photos', icon: Camera, label: 'Photos' },
  { to: '/notes', icon: FileText, label: 'Notes' },
]

const BottomNavigation: React.FC = () => {
  const location = useLocation()

  return (
    <div className="bg-white border-t border-neutral-200 safe-bottom">
      <nav className="flex items-center justify-around py-2">
        {navigationItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || 
                          (to !== '/dashboard' && location.pathname.startsWith(to))
          
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-xs font-medium transition-colors touch-target ${
                isActive 
                  ? 'text-primary-600' 
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon 
                className={`w-5 h-5 mb-1 ${
                  isActive ? 'text-primary-600' : 'text-neutral-500'
                }`} 
              />
              <span className="truncate max-w-[60px]">{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

export default BottomNavigation
