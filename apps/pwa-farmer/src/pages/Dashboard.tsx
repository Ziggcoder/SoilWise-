import React from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Activity, 
  Camera, 
  FileText, 
  AlertTriangle,
  Calendar,
  Droplets
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const quickStats = [
    {
      title: 'Active Fields',
      value: 0,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/fields'
    },
    {
      title: 'Observations',
      value: 0,
      icon: Camera,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/photos'
    },
    {
      title: 'Pending Tasks',
      value: 0,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      link: '/tasks'
    },
    {
      title: 'Alerts',
      value: 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      link: '/tasks'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Welcome back! Here's what's happening on your farm.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map(({ title, value, icon: Icon, color, bgColor, link }) => (
          <Link
            key={title}
            to={link}
            className="card hover:shadow-medium transition-shadow touch-feedback"
          >
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{value}</p>
                  <p className="text-sm text-neutral-600">{title}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-neutral-900">Quick Actions</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              to="/fields/new"
              className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors touch-feedback"
            >
              <MapPin className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Add Field</span>
            </Link>

            <Link
              to="/photos/capture"
              className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors touch-feedback"
            >
              <Camera className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Take Photo</span>
            </Link>

            <Link
              to="/notes/new"
              className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors touch-feedback"
            >
              <FileText className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">Add Note</span>
            </Link>

            <Link
              to="/sensors"
              className="flex flex-col items-center p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors touch-feedback"
            >
              <Activity className="w-6 h-6 text-primary-600 mb-2" />
              <span className="text-sm font-medium text-neutral-900">View Sensors</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
            <Link to="/photos" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <Camera className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600">No recent activity</p>
            <p className="text-sm text-neutral-500">Start by taking photos or adding notes</p>
          </div>
        </div>
      </div>

      {/* Weather Widget (placeholder) */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-neutral-900">Weather</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">22°C</p>
              <p className="text-neutral-600">Partly Cloudy</p>
              <p className="text-sm text-neutral-500">Humidity: 65%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
