import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const teamMembers = ['Alice', 'Bob', 'Charlie', 'Diana'];

  // Load tasks from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (task) => {
    setTasks([...tasks, task]);
  };

  const handleToggleComplete = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Task Manager Dashboard</h1>
        <TaskForm onAddTask={handleAddTask} teamMembers={teamMembers} />
        <TaskList tasks={tasks} onToggleComplete={handleToggleComplete} onDeleteTask={handleDeleteTask} />
      </div>
    </div>
  );
};

export default Dashboard;
