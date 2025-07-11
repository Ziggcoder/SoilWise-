import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { SensorDetails } from './pages/SensorDetails'
import { Alerts } from './pages/Alerts'
import { Settings } from './pages/Settings'
import { useMqttConnection } from './hooks/useMqttConnection'
import { initializeApp } from './store/slices/appSlice'
import './App.css'

function App() {
  const dispatch = useDispatch()
  useMqttConnection() // Initialize MQTT connection

  useEffect(() => {
    dispatch(initializeApp())
  }, [dispatch])

  return (
    <div className="App">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensors/:id" element={<SensorDetails />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App
