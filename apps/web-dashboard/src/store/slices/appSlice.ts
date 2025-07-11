import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  isInitialized: boolean
  mqttConnected: boolean
  loading: boolean
  error: string | null
  theme: 'light' | 'dark'
  notifications: boolean
}

const initialState: AppState = {
  isInitialized: false,
  mqttConnected: false,
  loading: false,
  error: null,
  theme: 'light',
  notifications: true,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initializeApp: (state) => {
      state.isInitialized = true
      state.loading = false
    },
    setMqttConnection: (state, action: PayloadAction<boolean>) => {
      state.mqttConnected = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  initializeApp,
  setMqttConnection,
  setLoading,
  setError,
  setTheme,
  toggleNotifications,
  clearError,
} = appSlice.actions

export default appSlice.reducer
