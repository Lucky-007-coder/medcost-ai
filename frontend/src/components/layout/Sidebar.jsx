import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, Calculator, SlidersHorizontal, Scale, 
  BarChart3, History, FileDown, Sun, Moon, Laptop, 
  Settings, Info, LogOut, ChevronDown, Activity, Heart,
  User, ShieldCheck, LogIn, Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { 
  ProfileModal, SettingsModal, AboutModal, DownloadReportsModal 
} from './SidebarModals';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  onSelectTab, 
  connectionStatus = 'online' 
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, logoutUser, resetToDefault } = useUser();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'settings' | 'about' | 'reports' | null
  const [signOutNotice, setSignOutNotice] = useState(false);
  const sidebarRef = useRef(null);

  // Prevent background scrolling while sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeModal, onClose]);

  // Navigation Items matching the reference screenshot exactly
  const navItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'estimator', label: 'Cost Estimator', icon: Calculator },
    { id: 'simulator', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'comparison', label: 'Prediction Comparison', icon: Scale },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'login', label: 'Health Intake & Login', icon: LogIn },
    { id: 'about', label: 'About Us', icon: Info },
    { 
      id: 'reports', 
      label: 'Download Reports', 
      icon: FileDown, 
      isAction: true,
      action: () => {
        setActiveModal('reports');
      }
    },
  ];

  const handleItemClick = (item) => {
    if (item.isAction && item.action) {
      item.action();
    } else {
      onSelectTab(item.id);
      onClose();
    }
  };

  const handleSignOutClick = () => {
    logoutUser();
    onSelectTab('login');
    onClose();
    setSignOutNotice(true);
    setTimeout(() => {
      setSignOutNotice(false);
    }, 4000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 font-sans flex">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs cursor-pointer"
              aria-hidden="true"
            />

            {/* Sidebar Drawer */}
            <motion.aside
              ref={sidebarRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-white dark:bg-[#000000] border-r border-[#E5E7EB] dark:border-[#1F2622] shadow-2xl flex flex-col z-10 overflow-hidden text-[#111827] dark:text-[#FFFFFF] transition-colors duration-200"
              role="dialog"
              aria-label="Navigation Sidebar"
              aria-modal="true"
            >
              {/* 1. Header (Logo + Close X) */}
              <div className="px-5 py-4 border-b border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between">
                <div 
                  className="flex items-center space-x-2.5 cursor-pointer group"
                  onClick={() => {
                    onSelectTab('overview');
                    onClose();
                  }}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#1B4332] dark:bg-[#091510] border border-[#2D6A4F] dark:border-[#1E4D38] flex items-center justify-center text-[#52B788] shadow-xs group-hover:scale-105 transition-transform">
                    <Activity className="w-4 h-4 text-[#52B788]" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-[#111827] dark:text-[#FFFFFF]">
                    MedCost<span className="text-[#1B4332] dark:text-[#52B788] font-serif italic">.ai</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF] hover:bg-[#F4F5F0] dark:hover:bg-[#121714] transition-colors cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. User Profile Section */}
              <div className="px-5 py-3.5 border-b border-[#E5E7EB] dark:border-[#1F2622]">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-full text-left flex items-center space-x-3.5 group cursor-pointer p-1.5 rounded-2xl hover:bg-[#F4F5F0] dark:hover:bg-[#0A0D0B] transition-colors"
                    aria-expanded={profileDropdownOpen}
                  >
                    {/* Monogram Avatar Badge */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm tracking-wider shadow-xs group-hover:ring-3 transition-all ${
                        user?.isLoggedIn 
                          ? 'bg-linear-to-br from-[#1B4332] to-[#2D6A4F] text-[#52B788] ring-2 ring-[#52B788]' 
                          : 'bg-linear-to-br from-neutral-700 to-neutral-900 text-neutral-300 ring-2 ring-neutral-500'
                      }`}>
                        {user?.initials || 'GU'}
                      </div>
                    </div>

                    {/* Metadata: Dynamic User Name, Role, Online / Signed Out */}
                    <div className="min-w-0 flex-grow">
                      <div className="text-sm font-bold text-[#111827] dark:text-[#FFFFFF] group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors truncate">
                        {user?.name || (user?.isLoggedIn ? 'Lucky Gupta' : 'Guest User')}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">
                        {user?.role || (user?.isLoggedIn ? 'BTech 2nd Year' : 'Not Signed In')}
                      </div>
                      <div className="flex items-center space-x-1.5 pt-0.5 text-[11px] font-medium">
                        {user?.isLoggedIn ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                            <span className="text-[#52B788]">Online</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-amber-500 font-normal">Signed Out</span>
                          </>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 text-[#6B7280] dark:text-[#A8B5AC] transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-2xl shadow-xl p-1.5 z-20 space-y-0.5 text-xs font-sans"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onSelectTab('login');
                            onClose();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[#111827] dark:text-[#F1F5F2] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors flex items-center space-x-2 cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5 text-[#52B788]" />
                          <span className="font-semibold">{user?.isLoggedIn ? 'Update Health Profile' : 'Sign In / Intake'}</span>
                        </button>
                        {!user?.isLoggedIn && (
                          <button
                            type="button"
                            onClick={() => {
                              resetToDefault();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-[#111827] dark:text-[#F1F5F2] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors flex items-center space-x-2 cursor-pointer font-medium"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#52B788]" />
                            <span>Restore Lucky Gupta Profile</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveModal('profile');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[#111827] dark:text-[#F1F5F2] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors flex items-center space-x-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveModal('profile');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[#111827] dark:text-[#F1F5F2] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors flex items-center space-x-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Edit Credentials</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveModal('settings');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-[#111827] dark:text-[#F1F5F2] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] hover:text-[#1B4332] dark:hover:text-[#52B788] transition-colors flex items-center space-x-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Account Preferences</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 3. Navigation Links List */}
              <div className="flex-grow overflow-y-auto px-3.5 py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] border border-[#C5DFD3] dark:border-[#23583E] font-semibold shadow-xs'
                          : 'text-[#4B5563] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF] hover:bg-[#F4F5F0] dark:hover:bg-[#0D1210]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-[#1B4332] dark:text-[#52B788]' : 'text-[#6B7280] dark:text-[#A8B5AC] group-hover:text-[#111827] dark:group-hover:text-[#FFFFFF]'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 4. Bottom Controls: Appearance, Account & Footer Card */}
              <div className="px-4 py-3.5 border-t border-[#E5E7EB] dark:border-[#1F2622] space-y-3 bg-white dark:bg-[#000000]">
                
                {/* Appearance 3-way toggle */}
                <div className="space-y-1.5">
                  <div 
                    className="flex items-center justify-between text-xs font-semibold text-[#6B7280] dark:text-[#A8B5AC] cursor-pointer px-1"
                    onClick={() => setAppearanceOpen(!appearanceOpen)}
                  >
                    <span className="uppercase text-[10px] font-mono tracking-wider">Appearance</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${appearanceOpen ? '' : '-rotate-90'}`} />
                  </div>

                  {appearanceOpen && (
                    <div className="grid grid-cols-3 gap-1 bg-[#F4F5F0] dark:bg-[#0A0D0B] p-1 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          theme === 'light'
                            ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs'
                            : 'text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Light</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs'
                            : 'text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Dark</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                          theme === 'system'
                            ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs'
                            : 'text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        <span className="text-[11px]">System</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Account Links */}
                <div className="space-y-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveModal('settings')}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF] hover:bg-[#F4F5F0] dark:hover:bg-[#0A0D0B] transition-colors flex items-center space-x-2.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('about');
                      onClose();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#FFFFFF] hover:bg-[#F4F5F0] dark:hover:bg-[#0A0D0B] transition-colors flex items-center space-x-2.5 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>About MedCost.ai</span>
                  </button>
                  {user?.isLoggedIn || user?.isGuest ? (
                    <button
                      type="button"
                      onClick={handleSignOutClick}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center space-x-2.5 cursor-pointer font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('login');
                        onClose();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-[#1B4332] dark:text-[#52B788] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] font-medium transition-colors flex items-center space-x-2.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5 text-[#52B788]" />
                      <span>Sign In / Health Intake</span>
                    </button>
                  )}
                  {signOutNotice && (
                    <div className="p-2 mt-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono animate-in fade-in">
                      ✓ Signed out. Session cleared to Guest mode.
                    </div>
                  )}
                </div>

                {/* Footer Card */}
                <div className="p-2.5 rounded-xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-center space-y-0.5">
                  <p className="text-[11px] font-medium text-[#111827] dark:text-[#FFFFFF] flex items-center justify-center gap-1">
                    <span className="text-rose-500 text-xs">🤍</span>
                    <span>Smarter Healthcare Decisions</span>
                  </p>
                  <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">
                    Powered by AI & Data Science
                  </p>
                </div>

              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Auxiliary Modals */}
      <ProfileModal 
        isOpen={activeModal === 'profile'} 
        onClose={() => setActiveModal(null)} 
      />
      <SettingsModal 
        isOpen={activeModal === 'settings'} 
        onClose={() => setActiveModal(null)} 
      />
      <AboutModal 
        isOpen={activeModal === 'about'} 
        onClose={() => setActiveModal(null)} 
      />
      <DownloadReportsModal 
        isOpen={activeModal === 'reports'} 
        onClose={() => setActiveModal(null)}
        onNavigateToHistory={() => {
          onSelectTab('history');
          onClose();
        }}
      />
    </>
  );
}
