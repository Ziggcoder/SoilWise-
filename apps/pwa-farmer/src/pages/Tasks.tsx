import React from 'react'

const Tasks: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Tasks</h1>
        <button className="btn btn-primary">Add Task</button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-center text-neutral-600 py-8">
            No tasks yet. Create tasks to manage your farming activities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Tasks
