import React from 'react'

const Notes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Notes</h1>
        <button className="btn btn-primary">Add Note</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            No notes yet. Start recording observations and field activities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Notes
