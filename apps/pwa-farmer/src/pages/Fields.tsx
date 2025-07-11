import React from 'react'

const Fields: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Fields</h1>
        <button className="btn btn-primary">Add Field</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            No fields yet. Start by adding your first field.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Fields
