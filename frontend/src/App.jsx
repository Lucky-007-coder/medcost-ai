import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import ProblemFraming from './components/home/ProblemFraming';
import EstimatorView from './components/estimator/EstimatorView';
import SimulatorView from './components/simulator/SimulatorView';
import ComparisonView from './components/comparison/ComparisonView';
import AnalyticsView from './components/analytics/AnalyticsView';
import HistoryView from './components/history/HistoryView';
import AboutUsView from './components/about/AboutUsView';
import LoginView from './components/auth/LoginView';

export default function App() {
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hasProfile = localStorage.getItem('medcost_user_profile');
      const hasGuest = localStorage.getItem('medcost_guest_active');
      if (hasProfile || hasGuest) {
        return 'overview';
      }
    } catch (e) {}
    // First-time visit on a new device or deployment: require login/guest selection first!
    return 'login';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [intakeData, setIntakeData] = useState(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Trigger lightweight resize event so Recharts can re-verify container dimensions
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] dark:bg-[#000000] font-sans text-[#111827] dark:text-[#FFFFFF] transition-colors duration-200">
      {/* Minimal Header with Hamburger Toggle & Status */}
      <Navbar 
        onOpenSidebar={() => setSidebarOpen(true)} 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
      />

      {/* Premium Left Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
      />

      {/* Main Content Area - Retains mounted views for instantaneous, zero-lag switching */}
      <main className="flex-grow">
        <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
          <HeroSection onExploreClick={handleTabChange} />
          <ProblemFraming onNavigate={handleTabChange} />
        </div>

        <div className={activeTab === 'estimator' ? 'block' : 'hidden'}>
          <EstimatorView intakeData={intakeData} />
        </div>

        <div className={activeTab === 'simulator' ? 'block' : 'hidden'}>
          <SimulatorView onNavigateToEstimator={() => handleTabChange('estimator')} />
        </div>

        <div className={activeTab === 'comparison' ? 'block' : 'hidden'}>
          <ComparisonView onNavigateToEstimator={() => handleTabChange('estimator')} />
        </div>

        <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
          <AnalyticsView />
        </div>

        <div className={activeTab === 'history' ? 'block' : 'hidden'}>
          <HistoryView onNavigateToEstimator={() => handleTabChange('estimator')} />
        </div>

        <div className={activeTab === 'about' ? 'block' : 'hidden'}>
          <AboutUsView onNavigate={handleTabChange} />
        </div>

        <div className={activeTab === 'login' ? 'block' : 'hidden'}>
          <LoginView 
            onComplete={() => handleTabChange('overview')} 
            onNavigateToEstimator={(healthProfile) => {
              setIntakeData(healthProfile);
              handleTabChange('estimator');
            }} 
          />
        </div>
      </main>

      {/* Clinical Footer */}
      <Footer />
    </div>
  );
}
