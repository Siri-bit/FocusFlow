import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Clock, Calendar, MoreVertical, DollarSign, Timer } from 'lucide-react';
import api from '../api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
      // Fallback or show error briefly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic auto-login for development ONLY
    const auth = async () => {
      if (!localStorage.getItem('access_token')) {
        try {
          const res = await api.post('/token/', {
            username: 'admin',
            password: 'admin123'
          });
          localStorage.setItem('access_token', res.data.access);
        } catch(e) { console.error('auto auth failed', e) }
      }
      fetchTasks();
    };
    auth();
  }, []);

  const handleAddTask = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await api.post('/tasks/', {
        title: newTask,
        priority: 'MEDIUM',
        is_completed: false,
        price: newPrice ? parseFloat(newPrice) : 0, 
      });
      setTasks([response.data, ...tasks]);
      setNewTask('');
      setNewPrice('');
      alert("Task Added!");
    } catch (error) {
      console.error('Failed to add task', error);
      alert("Failed to add task. Make sure you are logged in.");
    }
  };

  const setFocusTask = (task, e) => {
    e.stopPropagation();
    localStorage.setItem('focusTask', JSON.stringify({ id: task.id, title: task.title }));
    alert(`Set "${task.title}" as active for Pomodoro!`);
  };

  const toggleTask = async (id, currentStatus) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    try {
      await api.patch(`/tasks/${id}/toggle_complete/`);
    } catch (error) {
      // Revert on failure
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: currentStatus } : t));
      console.error('Failed to toggle task', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-50 text-red-600 border-red-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'LOW': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage your day and automate expenses.</p>
        </div>
      </header>
      
      {/* Create Task Input */}
      <form onSubmit={handleAddTask} className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center mb-8 gap-2 focus-within:ring-2 focus-within:ring-accent transition-all">
        <div className="flex w-full items-center gap-2">
          <div className="p-3 bg-gray-50 rounded-xl">
            <Plus className="w-5 h-5 text-gray-500" />
          </div>
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?" 
            className="flex-1 bg-transparent border-none outline-none text-gray-700 px-2 font-medium min-w-0"
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2 px-2 md:pl-0 border-t md:border-t-0 border-gray-100 pt-2 md:pt-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input 
              type="number" 
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Price (Opt.)" 
              className="w-full md:w-32 bg-gray-50 rounded-xl pl-7 pr-3 py-2.5 outline-none text-gray-700 font-medium text-sm"
            />
          </div>
          <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shrink-0">
            Add
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-6 flex-1 overflow-auto">
        <AnimatePresence>
          {loading ? (
             <div className="text-gray-400 text-center py-10">Loading tasks...</div>
          ) : tasks.length === 0 ? (
             <div className="text-gray-400 text-center py-10">No tasks yet. Create one above!</div>
          ) : tasks.map((task) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={task.id}
              className={`group flex items-center justify-between p-4 mb-3 rounded-2xl border transition-all ${
                task.is_completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-gray-300 shadow-sm hover:shadow'
              }`}
            >
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleTask(task.id, task.is_completed)}>
                <button 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    task.is_completed ? 'bg-accent border-accent text-white' : 'border-2 border-gray-300 text-transparent hover:border-accent'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
                <div>
                  <h3 className={`font-semibold text-lg transition-all ${task.is_completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.is_recurring && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                        <Clock className="w-3 h-3" /> Recurring
                      </span>
                    )}
                    {task.price > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                        <DollarSign className="w-3 h-3" /> Auto-Expense ${task.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                {!task.is_completed && (
                  <button 
                    onClick={(e) => setFocusTask(task, e)}
                    className="text-gray-400 hover:text-accent transition-colors p-2 rounded-lg hover:bg-gray-100"
                    title="Focus on this task"
                  >
                    <Timer className="w-5 h-5" />
                  </button>
                )}
                <button className="text-gray-300 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tasks;
