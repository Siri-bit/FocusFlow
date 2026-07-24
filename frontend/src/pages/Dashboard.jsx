import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Timer, DollarSign, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_tasks_completed: 0,
    total_focus_hours: 0,
    total_monthly_spending: 0,
    total_available_balance: 0,
    monthly_budget: 0,
    recent_activity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/summary/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Slight delay to ensure auth token is set if coming directly here
    setTimeout(fetchStats, 500); 
  }, []);
  
  const StatCard = ({ icon: Icon, title, value, colorClass, delay, unit }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:blur-xl transition-all ${colorClass.split(' ')[0]}`}></div>
      <div className={`relative p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="relative">
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
          {loading ? '...' : value}
          {unit && <span className="text-base text-gray-400 font-medium">{unit}</span>}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Your productivity overview
        </p>
      </header>

      {parseFloat(stats.monthly_budget) > 0 && parseFloat(stats.total_monthly_spending) > parseFloat(stats.monthly_budget) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl mb-6 flex items-start gap-3 shadow-sm"
        >
          <AlertCircle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-900">Budget Exceeded!</h3>
            <p className="text-sm mt-1">
              Your expenses (${parseFloat(stats.total_monthly_spending).toFixed(2)}) have exceeded your monthly budget (${parseFloat(stats.monthly_budget).toFixed(2)}). 
              <br />
              <span className="font-medium">Currently Available Amount: ${(parseFloat(stats.monthly_budget) - parseFloat(stats.total_monthly_spending)).toFixed(2)}</span>
            </p>
          </div>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={CheckCircle2} 
          title="Tasks Completed" 
          value={stats.total_tasks_completed} 
          colorClass="bg-emerald-50 text-emerald-600"
          delay={0.1}
        />
        <StatCard 
          icon={Timer} 
          title="Focus Hours" 
          value={stats.total_focus_hours} 
          unit="h"
          colorClass="bg-blue-50 text-blue-600"
          delay={0.2}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Total Available Balance" 
          value={`$${parseFloat(stats.total_available_balance || 0).toFixed(2)}`} 
          colorClass="bg-violet-50 text-violet-600"
          delay={0.3}
        />
        <StatCard 
          icon={DollarSign} 
          title="Monthly Spending" 
          value={`$${parseFloat(stats.total_monthly_spending).toFixed(2)}`} 
          colorClass="bg-rose-50 text-rose-600"
          delay={0.4}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* Placeholder for Productivity Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Activity & Focus</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
            <p className="text-gray-400 font-medium">Chart Visualization Area (Requires more data)</p>
          </div>
        </motion.div>
        
        {/* Recent Activity List - Mocked contextually */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Insights</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {stats.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className={`mt-1 w-2 h-2 rounded-full ${item.type === 'expense' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex gap-3 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Welcome to FocusFlow</p>
                  <p className="text-xs text-gray-500">Create tasks or track expenses to see insights here.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
