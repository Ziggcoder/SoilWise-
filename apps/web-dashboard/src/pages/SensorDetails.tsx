import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { selectSensor, setTimeRange, fetchSensorReadings } from '../store/slices/sensorSlice'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Battery, MapPin, Calendar, TrendingUp, Settings } from 'lucide-react'

export const SensorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  const sensor = useSelector((state: RootState) => 
    state.sensors.sensors.find(s => s.id === id)
  )
  const readings = useSelector((state: RootState) => 
    id ? state.sensors.readings[id] || [] : []
  )
  const timeRange = useSelector((state: RootState) => state.sensors.timeRange)
  const loading = useSelector((state: RootState) => state.sensors.loading)

  const [selectedMetric, setSelectedMetric] = useState<'value' | 'battery'>('value')

  useEffect(() => {
    if (id) {
      dispatch(selectSensor(id))
      dispatch(fetchSensorReadings({ sensorId: id, timeRange }))
    }
  }, [dispatch, id, timeRange])

  if (!sensor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sensor not found</h3>
          <p className="text-gray-500 mb-4">The requested sensor could not be located.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const chartData = readings.map(reading => ({
    timestamp: new Date(reading.timestamp).toLocaleTimeString(),
    value: reading.value,
    quality: reading.quality,
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100'
      case 'offline': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600'
    if (level > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const isInThreshold = (value: number) => {
    return value >= sensor.thresholds.min && value <= sensor.thresholds.max
  }

  const getValueStatus = () => {
    if (sensor.value < sensor.thresholds.min) return { status: 'Low', color: 'text-blue-600' }
    if (sensor.value > sensor.thresholds.max) return { status: 'High', color: 'text-red-600' }
    if (sensor.value > sensor.thresholds.critical) return { status: 'Critical', color: 'text-red-800' }
    return { status: 'Normal', color: 'text-green-600' }
  }

  const valueStatus = getValueStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sensor.name}</h1>
            <p className="text-gray-600 capitalize">{sensor.type.replace('_', ' ')} Sensor</p>
          </div>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {sensor.value?.toFixed(1) || '--'}
                <span className="text-sm text-gray-500 ml-1">{sensor.unit}</span>
              </p>
              <p className={`text-sm font-medium ${valueStatus.color}`}>
                {valueStatus.status}
              </p>
            </div>
            <TrendingUp className={`w-6 h-6 ${valueStatus.color}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{sensor.status}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sensor.status)}`}>
                {sensor.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Battery Level</p>
              <p className={`text-2xl font-bold ${getBatteryColor(sensor.batteryLevel)}`}>
                {sensor.batteryLevel}%
              </p>
            </div>
            <Battery className={`w-6 h-6 ${getBatteryColor(sensor.batteryLevel)}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Location</p>
              <p className="text-sm text-gray-900">{sensor.location.field}</p>
              <p className="text-xs text-gray-500">
                {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
              </p>
            </div>
            <MapPin className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Historical Data</h2>
          
          <div className="flex items-center space-x-4">
            {/* Metric Selector */}
            <div className="flex bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setSelectedMetric('value')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedMetric === 'value'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sensor Value
              </button>
              <button
                onClick={() => setSelectedMetric('battery')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedMetric === 'battery'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Battery Level
              </button>
            </div>

            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-md p-1">
              {(['1h', '24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => dispatch(setTimeRange(range))}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    timeRange === range
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data available for the selected time range</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} ${selectedMetric === 'value' ? sensor.unit : '%'}`,
                    selectedMetric === 'value' ? 'Sensor Value' : 'Battery Level'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Thresholds */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thresholds</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-800">Minimum</p>
            <p className="text-xl font-bold text-green-900">
              {sensor.thresholds.min} {sensor.unit}
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Maximum</p>
            <p className="text-xl font-bold text-yellow-900">
              {sensor.thresholds.max} {sensor.unit}
            </p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm font-medium text-red-800">Critical</p>
            <p className="text-xl font-bold text-red-900">
              {sensor.thresholds.critical} {sensor.unit}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
