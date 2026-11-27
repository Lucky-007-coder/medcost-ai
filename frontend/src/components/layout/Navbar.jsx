import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Menu, BookOpen, Calculator, Sliders, 
  GitCompare, BarChart3, History 
} from 'lucide-react';
import { getHealth } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ 
  onOpenSidebar, 
  activeTab, 
  setActiveTab 
}) {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const { resolvedTheme } = useTheme();

  const checkHealth = () => {
    getHealth()
      .then((data) => {
        if (data.status === 'healthy' && data.models_loaded) {
          setConnectionStatus('online');
        } else {
          setConnectionStatus('offline');
        }
      })
      .catch(() => {
        setConnectionStatus('offline');
      });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Reduced, concise labels without bulky badge text to keep navbar compact and sleek
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'estimator', label: 'Estimator', icon: Calculator },
    { id: 'simulator', label: 'Simulator', icon: Sliders },
    { id: 'comparison', label: 'Compare', icon: GitCompare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/95 dark:bg-[#000000]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1F2622] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Compact Hamburger & Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Hamburger Toggle Button */}
            <button
              type="button"
              onClick={onOpenSidebar}
              className="p-2 rounded-xl text-[#111827] dark:text-[#FFFFFF] hover:text-[#1B4332] dark:hover:text-[#52B788] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] border border-[#E5E7EB] dark:border-[#1F2622] transition-all shadow-xs cursor-pointer group"
              aria-label="Open navigation sidebar"
              title="Open navigation sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-105" />
            </button>

            {/* MedCost.ai Brand Identity */}
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => setActiveTab('overview')}
              title="Go to Overview"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1B4332] dark:bg-[#080B09] flex items-center justify-center text-[#E6EFEA] border border-[#2D6A4F] dark:border-[#52B788]/40 shadow-xs group-hover:scale-105 transition-transform">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#52B788]" />
              </div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#111827] dark:text-[#FFFFFF] font-sans">
                  MedCost<span className="text-[#1B4332] dark:text-[#52B788] font-serif italic">.ai</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
                  OLS
                </span>
              </div>
            </div>
          </div>

          {/* Center-Right: Compact Navigation Pill Bar with Reduced Written Text */}
          <div className="flex items-center space-x-2.5">
            <nav className="hidden lg:flex items-center p-1 rounded-xl bg-[#E6EFEA]/60 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] shadow-xs">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center space-x-1.5 cursor-pointer ${
                      isActive 
                        ? 'text-white font-semibold' 
                        : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-[#1B4332] dark:bg-[#133324] border border-transparent dark:border-[#23583E] rounded-lg shadow-xs"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 relative z-10 ${
                      isActive 
                        ? (resolvedTheme === 'dark' ? 'text-[#52B788]' : 'text-white') 
                        : 'text-[#6B7280] dark:text-[#9CA3AF]'
                    }`} />
                    <span className={`relative z-10 font-sans ${
                      isActive && resolvedTheme === 'dark' ? 'text-[#52B788]' : ''
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Compact System Status Indicator */}
            <div 
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border transition-all ${
                connectionStatus === 'online'
                  ? 'bg-[#E6EFEA] dark:bg-[#080B09] border-[#CBE0D4] dark:border-[#1F2622] text-[#1B4332] dark:text-[#52B788]'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              }`}
              title={
                connectionStatus === 'online'
                  ? 'Flask API & OLS Models Active'
                  : connectionStatus === 'connecting'
                  ? 'Connecting to Flask API...'
                  : 'Backend API Offline'
              }
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                connectionStatus === 'online'
                  ? 'bg-[#52B788] animate-pulse'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`} />
              <span className="font-sans font-medium text-[10px] sm:text-[11px]">
                {connectionStatus === 'online' ? 'Active' : connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
