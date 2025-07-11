import React from 'react'
import { useParams } from 'react-router-dom'

const FieldDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Field Details</h1>
        <button className="btn btn-primary">Edit Field</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            Field details for ID: {id}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FieldDetail
