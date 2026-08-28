import React from 'react';

const TaskItem = ({ task, onToggleComplete, onDeleteTask }) => {
  const priorityColor = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${ task.completed ? 'border-gray-400 opacity-60' : 'border-blue-500' }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            className="mt-1 w-5 h-5 cursor-pointer"
          />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.name}
            </h3>
            {task.description && <p className="text-gray-600 text-sm mt-1">{task.description}</p>}
            <div className="flex gap-2 mt-3">
              <span className={`text-xs px-2 py-1 rounded ${priorityColor[task.priority]}`}>
                {task.priority.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                {task.assignee}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDeleteTask(task.id)}
          className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
