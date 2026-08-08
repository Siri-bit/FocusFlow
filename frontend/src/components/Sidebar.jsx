import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Timer, Wallet, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ setIsAuthenticated }) => {
  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
    { to: '/expenses', icon: Wallet, label: 'Expenses' },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-100 flex flex-col items-center md:items-start md:px-6 py-8 h-full shadow-sm">
      <div className="flex items-center gap-3 mb-10 w-full justify-center md:justify-start">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <CheckSquare className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hidden md:block">FocusFlow</h1>
      </div>
      
      <nav className="flex flex-col gap-2 w-full flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 w-full justify-center md:justify-start ${
                isActive
                  ? 'bg-gray-50 text-accent font-semibold shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
                <span className="hidden md:block">{link.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-8 bg-accent rounded-r-full md:hidden" 
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="w-full flex flex-col gap-2">
        <button 
          onClick={() => {
            localStorage.removeItem('access_token');
            setIsAuthenticated(false);
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 w-full justify-center md:justify-start transition-colors font-medium border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
