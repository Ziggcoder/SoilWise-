import React from 'react'

const Photos: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Photos</h1>
        <button className="btn btn-primary">Take Photo</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            No photos yet. Start capturing field conditions and observations.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Photos
