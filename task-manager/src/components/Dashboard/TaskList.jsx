import React from 'react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleComplete, onDeleteTask }) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-500 text-lg">No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-semibold text-gray-700">
          Progress: {completedCount} of {totalCount} tasks completed ({Math.round((completedCount / totalCount) * 100)}%)
        </p>
        <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;
