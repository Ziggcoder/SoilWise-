import React from 'react'

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            Settings and preferences will be available here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
