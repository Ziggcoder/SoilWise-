import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  sensorId?: string
  timestamp: string
  acknowledged: boolean
}

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  loading: boolean
  error: string | null
}

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
  loading: false,
  error: null,
}

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    addAlert: (state, action: PayloadAction<Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>>) => {
      const alert: Alert = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        acknowledged: false,
      }
      state.alerts.unshift(alert)
      state.unreadCount += 1
    },
    acknowledgeAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload)
      if (alert && !alert.acknowledged) {
        alert.acknowledged = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    clearAlert: (state, action: PayloadAction<string>) => {
      const index = state.alerts.findIndex(a => a.id === action.payload)
      if (index !== -1) {
        const alert = state.alerts[index]
        if (!alert.acknowledged) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.alerts.splice(index, 1)
      }
    },
    clearAllAlerts: (state) => {
      state.alerts = []
      state.unreadCount = 0
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  addAlert,
  acknowledgeAlert,
  clearAlert,
  clearAllAlerts,
  setLoading,
  setError,
} = alertSlice.actions

export default alertSlice.reducer
