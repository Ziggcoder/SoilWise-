import React from 'react'

const Sync: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Sync</h1>
        <button className="btn btn-primary">Sync Now</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            All data is synchronized. No pending items.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sync
