import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Sensor {
  id: string
  name: string
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nutrients'
  location: {
    lat: number
    lng: number
    field: string
  }
  value: number
  unit: string
  batteryLevel: number
  lastReading: string
  status: 'online' | 'offline' | 'error'
  thresholds: {
    min: number
    max: number
    critical: number
  }
}

export interface SensorReading {
  id: string
  sensorId: string
  value: number
  timestamp: string
  quality: 'good' | 'fair' | 'poor'
}

interface SensorState {
  sensors: Sensor[]
  readings: Record<string, SensorReading[]>
  loading: boolean
  error: string | null
  selectedSensor: string | null
  timeRange: '1h' | '24h' | '7d' | '30d'
}

const initialState: SensorState = {
  sensors: [],
  readings: {},
  loading: false,
  error: null,
  selectedSensor: null,
  timeRange: '24h',
}

// Async thunks
export const fetchSensors = createAsyncThunk(
  'sensors/fetchSensors',
  async () => {
    const response = await fetch('/api/sensors')
    return response.json()
  }
)

export const fetchSensorReadings = createAsyncThunk(
  'sensors/fetchReadings',
  async ({ sensorId, timeRange }: { sensorId: string; timeRange: string }) => {
    const response = await fetch(`/api/sensors/${sensorId}/readings?range=${timeRange}`)
    return { sensorId, readings: await response.json() }
  }
)

const sensorSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    selectSensor: (state, action: PayloadAction<string>) => {
      state.selectedSensor = action.payload
    },
    setTimeRange: (state, action: PayloadAction<'1h' | '24h' | '7d' | '30d'>) => {
      state.timeRange = action.payload
    },
    updateSensorReading: (state, action: PayloadAction<{ sensorId: string; reading: SensorReading }>) => {
      const { sensorId, reading } = action.payload
      if (!state.readings[sensorId]) {
        state.readings[sensorId] = []
      }
      state.readings[sensorId].unshift(reading)
      
      // Update sensor current value
      const sensor = state.sensors.find(s => s.id === sensorId)
      if (sensor) {
        sensor.value = reading.value
        sensor.lastReading = reading.timestamp
        sensor.status = 'online'
      }
    },
    updateSensorStatus: (state, action: PayloadAction<{ sensorId: string; status: 'online' | 'offline' | 'error' }>) => {
      const sensor = state.sensors.find(s => s.id === action.payload.sensorId)
      if (sensor) {
        sensor.status = action.payload.status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSensors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSensors.fulfilled, (state, action) => {
        state.loading = false
        state.sensors = action.payload
      })
      .addCase(fetchSensors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch sensors'
      })
      .addCase(fetchSensorReadings.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSensorReadings.fulfilled, (state, action) => {
        state.loading = false
        const { sensorId, readings } = action.payload
        state.readings[sensorId] = readings
      })
      .addCase(fetchSensorReadings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch readings'
      })
  },
})

export const { selectSensor, setTimeRange, updateSensorReading, updateSensorStatus } = sensorSlice.actions
export default sensorSlice.reducer
