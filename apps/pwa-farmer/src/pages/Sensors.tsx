import React from 'react'

const Sensors: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Sensors</h1>
        <button className="btn btn-primary">Add Sensor</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            No sensors configured. Connect your first sensor to start monitoring.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sensors
