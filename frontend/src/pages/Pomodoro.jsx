import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, CheckCircle2 } from 'lucide-react';

const Pomodoro = () => {
  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('WORK'); // WORK or BREAK
  const [activeTask, setActiveTask] = useState({ title: 'Select a task from Tasks page', id: null });
  
  // Also imported api
  useEffect(() => {
    const saved = localStorage.getItem('focusTask');
    if (saved) {
      setActiveTask(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (isRunning && timeLeft <= 0) {
      // Timer finished!
      setIsRunning(false);
      if (mode === 'WORK') {
        // Trigger save session to backend here
        if (activeTask.id) {
            fetch(`http://localhost:8000/api/tasks/${activeTask.id}/increment_pomodoro/`, {
               method: 'POST',
               headers: {'Authorization': `Bearer ${localStorage.getItem('access_token')}`}
            }).catch(e => console.error(e));
        }
        setMode('BREAK');
        setTimeLeft(BREAK_TIME);
      } else {
        setMode('WORK');
        setTimeLeft(WORK_TIME);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'WORK' ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = 1 - (timeLeft / (mode === 'WORK' ? WORK_TIME : BREAK_TIME));
  const circumference = 2 * Math.PI * 120; // r=120
  
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-center p-4">
      {/* Active Mode Pill */}
      <motion.div 
        layout
        className={`flex items-center gap-2 px-6 py-2 rounded-full mb-12 font-bold tracking-widest text-sm transition-colors ${
          mode === 'WORK' ? 'bg-primary text-white' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        {mode === 'WORK' ? <CheckCircle2 className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
        {mode === 'WORK' ? 'FOCUS MODE' : 'SHORT BREAK'}
      </motion.div>

      {/* Timer Display */}
      <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-16">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="50%" cy="50%" r="45%" 
            className="stroke-gray-100 fill-transparent" strokeWidth="8"
          />
          {/* Progress Circle */}
          <motion.circle 
            cx="50%" cy="50%" r="45%" 
            className={`fill-transparent transition-colors duration-500 ease-in-out ${mode === 'WORK' ? 'stroke-accent' : 'stroke-emerald-400'}`} 
            strokeWidth="8"
            strokeLinecap="round"
            style={{ 
              strokeDasharray: circumference, 
              strokeDashoffset: isRunning ? circumference - (progress * circumference) : circumference - (progress * circumference) // handled cleanly by Framer
            }}
            animate={{ strokeDashoffset: circumference - (progress * circumference) }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </svg>
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-mono font-bold text-gray-900 tracking-tighter tabular-nums drop-shadow-sm">
            {formatTime(timeLeft)}
          </h1>
          <p className="mt-4 text-gray-400 font-medium">
            {mode === 'WORK' ? 'Deep work' : 'Take a breather'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 items-center mb-16">
        <button onClick={resetTimer} className="w-14 h-14 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm">
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
            isRunning 
              ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
              : 'bg-primary hover:bg-gray-800 shadow-gray-900/30'
          }`}
        >
          {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
      </div>

      {/* Active Task Linker */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 shadow-sm rounded-2xl px-6 py-4 flex items-center gap-4 w-full max-w-md shadow-emerald-900/5 cursor-pointer hover:border-accent transition-colors"
      >
        <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Working on</p>
          <p className="text-gray-900 font-semibold">{activeTask.title}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Pomodoro;
