import React, { createContext, useContext, useState, useEffect } from 'react';

export const DEVELOPERS = [
  {
    id: 'lucky',
    name: 'Lucky Gupta',
    role: 'Project Lead & Predictive Modeling',
    initials: 'LG',
    email: 'lucky.gupta@student.university.edu',
    pin: '121',
    region: 'Central',
    bio: 'Lead Researcher & Developer specializing in OLS normal equations and closed-form decomposition.',
    isDeveloper: true,
    healthProfile: {
      age: 21,
      sex: 'Male',
      bmi: 22.8,
      smoker: 'Never',
      systolic_bp: 118,
      hba1c: 5.2,
      dependents: 0,
      visits_last_year: 1,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      plan_type: 'HMO',
      income: 45000,
      deductible: 1000
    }
  },
  {
    id: 'ahsan',
    name: 'Ahsan Afaque',
    role: 'Healthcare Informatics & Systems Architecture',
    initials: 'AA',
    email: 'ahsan.afaque@student.university.edu',
    pin: '124',
    region: 'North',
    bio: 'Systems Architect designing high-throughput Flask APIs and SQLite transactional audit trails.',
    isDeveloper: true,
    healthProfile: {
      age: 22,
      sex: 'Male',
      bmi: 23.4,
      smoker: 'Never',
      systolic_bp: 120,
      hba1c: 5.3,
      dependents: 0,
      visits_last_year: 2,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      plan_type: 'PPO',
      income: 52000,
      deductible: 1000
    }
  },
  {
    id: 'koushik',
    name: 'Koushik Badayakar',
    role: 'Statistical Analysis & Model Benchmarking',
    initials: 'KB',
    email: 'koushik.badayakar@student.university.edu',
    pin: '112',
    region: 'East',
    bio: 'Statistical Auditor auditing Gauss-Markov BLUE criteria, VIF collinearity, and Cook distance.',
    isDeveloper: true,
    healthProfile: {
      age: 22,
      sex: 'Male',
      bmi: 24.1,
      smoker: 'Never',
      systolic_bp: 122,
      hba1c: 5.4,
      dependents: 0,
      visits_last_year: 1,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      plan_type: 'HMO',
      income: 48000,
      deductible: 1000
    }
  },
  {
    id: 'koustav',
    name: 'Koustav Ghosh',
    role: 'Econometric Validation & Actuarial Research',
    initials: 'KG',
    email: 'koustav.ghosh@student.university.edu',
    pin: '113',
    region: 'South',
    bio: 'Actuarial Economics Researcher validating smoking risk multipliers and clinical risk pooling.',
    isDeveloper: true,
    healthProfile: {
      age: 21,
      sex: 'Male',
      bmi: 23.0,
      smoker: 'Never',
      systolic_bp: 119,
      hba1c: 5.1,
      dependents: 0,
      visits_last_year: 1,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      plan_type: 'EPO',
      income: 46000,
      deductible: 1000
    }
  },
  {
    id: 'samiul',
    name: 'Kazi Samiul',
    role: 'Frontend UI/UX & Interaction Engineering',
    initials: 'KS',
    email: 'kazi.samiul@student.university.edu',
    pin: '106',
    region: 'West',
    bio: 'Frontend Interaction Engineer building Typeform intake UX, OLED pitch-black dark mode, and Recharts.',
    isDeveloper: true,
    healthProfile: {
      age: 22,
      sex: 'Male',
      bmi: 22.5,
      smoker: 'Never',
      systolic_bp: 117,
      hba1c: 5.0,
      dependents: 0,
      visits_last_year: 1,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      plan_type: 'HMO',
      income: 50000,
      deductible: 1000
    }
  }
];

export const DEFAULT_USER = DEVELOPERS[0]; // Lucky Gupta

export const GUEST_USER = {
  name: 'Guest User',
  role: 'Guest Visitor',
  initials: 'GU',
  email: '',
  region: 'Central',
  bio: 'Guest session. Complete the interactive health intake to personalize your clinical profile.',
  healthProfile: {
    age: 30,
    sex: 'Female',
    bmi: 24.5,
    smoker: 'Never',
    systolic_bp: 120,
    hba1c: 5.4,
    dependents: 0,
    visits_last_year: 1,
    hospitalizations_last_3yrs: 0,
    chronic_count: 0,
    plan_type: 'HMO',
    income: 50000,
    deductible: 1000
  },
  isLoggedIn: false,
  isGuest: true
};

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('medcost_user_profile');
      if (stored) {
        return JSON.parse(stored);
      }
      if (localStorage.getItem('medcost_guest_active') === 'true') {
        return GUEST_USER;
      }
      if (localStorage.getItem('medcost_logged_out') === 'true') {
        return GUEST_USER;
      }
    } catch (e) {
      console.error('Failed to parse stored user profile:', e);
    }
    // If no existing session on this device, default to GUEST_USER with isLoggedIn=false
    return GUEST_USER;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const loginUser = (profileData) => {
    const name = profileData.name || 'User';
    const updatedUser = {
      ...profileData,
      initials: getInitials(name),
      isLoggedIn: true,
      isGuest: false,
      lastLogin: new Date().toISOString()
    };
    setUser(updatedUser);
    try {
      localStorage.removeItem('medcost_logged_out');
      localStorage.removeItem('medcost_guest_active');
      localStorage.setItem('medcost_user_profile', JSON.stringify(updatedUser));
    } catch (e) {}
  };

  const loginDeveloper = (devId, enteredPin) => {
    const dev = DEVELOPERS.find(d => d.id === devId);
    if (!dev) {
      return { success: false, error: 'Developer not found' };
    }
    if (dev.pin !== String(enteredPin).trim()) {
      return { success: false, error: 'Incorrect PIN. Try again.' };
    }
    const devProfile = {
      name: dev.name,
      role: dev.role,
      initials: dev.initials,
      email: dev.email,
      region: dev.region,
      bio: dev.bio,
      isDeveloper: true,
      isLoggedIn: true,
      isGuest: false,
      healthProfile: { ...dev.healthProfile },
      lastLogin: new Date().toISOString()
    };
    setUser(devProfile);
    try {
      localStorage.removeItem('medcost_guest_active');
      localStorage.removeItem('medcost_logged_out');
      localStorage.setItem('medcost_user_profile', JSON.stringify(devProfile));
    } catch (e) {}
    return { success: true, user: devProfile };
  };

  const loginAsGuest = () => {
    const guest = { ...GUEST_USER, isLoggedIn: false, isGuest: true };
    setUser(guest);
    try {
      localStorage.removeItem('medcost_user_profile');
      localStorage.removeItem('medcost_logged_out');
      localStorage.setItem('medcost_guest_active', 'true');
    } catch (e) {}
    return guest;
  };

  const logoutUser = () => {
    setUser(GUEST_USER);
    try {
      localStorage.removeItem('medcost_user_profile');
      localStorage.removeItem('medcost_guest_active');
      localStorage.setItem('medcost_logged_out', 'true');
    } catch (e) {}
  };

  const resetToDefault = () => {
    setUser(DEFAULT_USER);
    try {
      localStorage.removeItem('medcost_logged_out');
      localStorage.removeItem('medcost_guest_active');
      localStorage.setItem('medcost_user_profile', JSON.stringify(DEFAULT_USER));
    } catch (e) {}
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loginUser, 
      loginDeveloper, 
      loginAsGuest, 
      logoutUser, 
      resetToDefault, 
      getInitials,
      developers: DEVELOPERS 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
