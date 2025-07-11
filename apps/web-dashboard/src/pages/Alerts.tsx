import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { acknowledgeAlert, clearAlert, clearAllAlerts } from '../store/slices/alertSlice'
import { AlertTriangle, CheckCircle, XCircle, Trash2, Filter, Bell, BellOff } from 'lucide-react'

export const Alerts: React.FC = () => {
  const dispatch = useDispatch()
  const alerts = useSelector((state: RootState) => state.alerts.alerts)
  const unreadCount = useSelector((state: RootState) => state.alerts.unreadCount)
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'error' | 'warning' | 'info'>('all')
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.acknowledged
    return alert.type === filter
  })

  const handleAcknowledge = (alertId: string) => {
    dispatch(acknowledgeAlert(alertId))
    setSelectedAlerts(prev => prev.filter(id => id !== alertId))
  }

  const handleDelete = (alertId: string) => {
    dispatch(clearAlert(alertId))
    setSelectedAlerts(prev => prev.filter(id => id !== alertId))
  }

  const handleBulkAcknowledge = () => {
    selectedAlerts.forEach(alertId => {
      dispatch(acknowledgeAlert(alertId))
    })
    setSelectedAlerts([])
  }

  const handleBulkDelete = () => {
    selectedAlerts.forEach(alertId => {
      dispatch(clearAlert(alertId))
    })
    setSelectedAlerts([])
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all alerts?')) {
      dispatch(clearAllAlerts())
      setSelectedAlerts([])
    }
  }

  const toggleSelectAlert = (alertId: string) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    )
  }

  const selectAllVisible = () => {
    setSelectedAlerts(filteredAlerts.map(alert => alert.id))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Bell className="w-5 h-5 text-blue-500" />
    }
  }

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Alerts', count: alerts.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'error', label: 'Errors', count: alerts.filter(a => a.type === 'error').length },
    { value: 'warning', label: 'Warnings', count: alerts.filter(a => a.type === 'warning').length },
    { value: 'info', label: 'Info', count: alerts.filter(a => a.type === 'info').length },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600">
            Monitor and manage system alerts and notifications
          </p>
        </div>
        
        {alerts.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BellOff className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'error').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'warning').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          {/* Filter Options */}
          <div className="flex items-center space-x-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex space-x-2">
              {filterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    filter === option.value
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedAlerts.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedAlerts.length} selected
              </span>
              <button
                onClick={handleBulkAcknowledge}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200"
              >
                Acknowledge
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Select All */}
        {filteredAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={selectAllVisible}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Select all visible alerts
            </button>
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You don't have any alerts at the moment."
                : `No ${filter} alerts found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 transition-colors ${
                  selectedAlerts.includes(alert.id) ? 'bg-blue-50' : ''
                } ${!alert.acknowledged ? getAlertBgColor(alert.type) : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedAlerts.includes(alert.id)}
                    onChange={() => toggleSelectAlert(alert.id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />

                  {/* Alert Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          alert.acknowledged ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {alert.message}
                        </p>
                        
                        <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          {alert.sensorId && (
                            <span>Sensor: {alert.sensorId}</span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            alert.type === 'error' ? 'bg-red-100 text-red-800' :
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.type}
                          </span>
                          {alert.acknowledged && (
                            <span className="inline-flex items-center text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Acknowledged
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="p-1 text-green-600 hover:text-green-500"
                            title="Acknowledge"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-1 text-red-600 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
