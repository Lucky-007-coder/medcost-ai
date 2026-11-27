import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, MapPin, Briefcase, Calendar, Heart, 
  Activity, Stethoscope, Shield, CheckCircle2, ArrowRight, 
  ArrowLeft, Sparkles, Scale, AlertCircle, LogIn, Lock, 
  ChevronRight, Calculator, Key, Code2, X, Terminal, Users
} from 'lucide-react';
import { useUser, DEVELOPERS } from '../../context/UserContext';

export default function LoginView({ onComplete, onNavigateToEstimator }) {
  const { user, loginUser, loginDeveloper, loginAsGuest } = useUser();

  // Mode: 'welcome' (gateway with developer direct login & guest access) or 'intake' (16-step single question questionnaire)
  const [viewMode, setViewMode] = useState('welcome');
  
  // Developer Login State
  const [selectedDev, setSelectedDev] = useState(null);
  const [devPin, setDevPin] = useState('');
  const [devError, setDevError] = useState('');
  const [devSuccess, setDevSuccess] = useState(false);

  // Current Step Index (0 to 15) for intake mode
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    // Personal
    name: user?.name || '',
    email: user?.email || '',
    address: '124 Healthcare Boulevard',
    region: user?.region || 'Central',
    role: user?.role || '',
    bio: user?.bio || '',
    // Medical (One-by-one)
    age: user?.healthProfile?.age || 28,
    sex: user?.healthProfile?.sex || 'Male',
    heightCm: 175,
    weightKg: 72,
    bmi: user?.healthProfile?.bmi || 23.5,
    smoker: user?.healthProfile?.smoker || 'Never',
    systolic_bp: user?.healthProfile?.systolic_bp || 120,
    hba1c: user?.healthProfile?.hba1c || 5.4,
    dependents: user?.healthProfile?.dependents || 0,
    visits_last_year: user?.healthProfile?.visits_last_year || 1,
    hospitalizations_last_3yrs: user?.healthProfile?.hospitalizations_last_3yrs || 0,
    chronic_conditions: ['None'],
    plan_type: user?.healthProfile?.plan_type || 'HMO',
    income: user?.healthProfile?.income || 65000,
    deductible: user?.healthProfile?.deductible || 1000
  });

  // Calculate BMI when height or weight changes
  const updateBmi = (hCm, wKg) => {
    if (hCm > 0) {
      const hM = hCm / 100;
      const calculated = parseFloat((wKg / (hM * hM)).toFixed(1));
      setFormData(prev => ({ ...prev, heightCm: hCm, weightKg: wKg, bmi: calculated }));
    }
  };

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600 bg-amber-600/10 border-amber-600/30' };
    return { label: 'Obese (Class I/II)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const getBpCategory = (bp) => {
    if (bp < 120) return { label: 'Normal (< 120)', color: 'text-emerald-500' };
    if (bp < 130) return { label: 'Elevated (120-129)', color: 'text-amber-500' };
    if (bp < 140) return { label: 'Stage 1 Hypertension (130-139)', color: 'text-orange-500' };
    return { label: 'Stage 2 Hypertension (≥ 140)', color: 'text-rose-500' };
  };

  const getHba1cCategory = (val) => {
    if (val < 5.7) return { label: 'Normal (< 5.7%)', color: 'text-emerald-500' };
    if (val < 6.5) return { label: 'Prediabetes (5.7% - 6.4%)', color: 'text-amber-500' };
    return { label: 'Diabetes Range (≥ 6.5%)', color: 'text-rose-500' };
  };

  const totalSteps = 16;
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = (target = 'dashboard') => {
    const finalProfile = {
      name: formData.name.trim() || 'Lucky Gupta',
      role: formData.role.trim() || 'Healthcare Policyholder',
      email: formData.email.trim() || 'user@medcost.ai',
      region: formData.region,
      address: formData.address,
      bio: formData.bio || 'Active MedCost.ai member managing healthcare economics.',
      healthProfile: {
        age: parseInt(formData.age),
        sex: formData.sex,
        bmi: parseFloat(formData.bmi),
        smoker: formData.smoker,
        systolic_bp: parseInt(formData.systolic_bp),
        hba1c: parseFloat(formData.hba1c),
        dependents: parseInt(formData.dependents),
        visits_last_year: parseInt(formData.visits_last_year),
        hospitalizations_last_3yrs: parseInt(formData.hospitalizations_last_3yrs),
        chronic_count: formData.chronic_conditions.filter(c => c !== 'None').length,
        plan_type: formData.plan_type,
        income: parseInt(formData.income),
        deductible: parseInt(formData.deductible)
      }
    };

    loginUser(finalProfile);

    if (target === 'estimator' && onNavigateToEstimator) {
      onNavigateToEstimator(finalProfile.healthProfile);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handleDevLoginSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedDev) return;
    setDevError('');

    const res = loginDeveloper(selectedDev.id, devPin);
    if (res.success) {
      setDevSuccess(true);
      setTimeout(() => {
        setDevSuccess(false);
        setSelectedDev(null);
        setDevPin('');
        if (onComplete) onComplete();
      }, 450);
    } else {
      setDevError(res.error || 'Incorrect PIN. Try again.');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (viewMode === 'intake') {
      if (e.key === 'Enter' && currentStep < totalSteps - 1) {
        handleNext();
      }
    } else if (selectedDev && e.key === 'Enter') {
      handleDevLoginSubmit();
    }
  };

  return (
    <div 
      className="min-h-screen py-10 md:py-16 bg-[#FBFBFA] dark:bg-[#000000] text-[#111827] dark:text-[#FFFFFF] flex flex-col justify-center items-center px-4 sm:px-6 transition-colors duration-200"
      onKeyDown={handleKeyDown}
    >
      {viewMode === 'welcome' && (
        /* ================= 1. PRIMARY WELCOME LOGIN PAGE ================= */
        <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-300">
          
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              <Shield className="w-3.5 h-3.5 text-[#52B788]" />
              <span>Authentication & Access Portal</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#111827] dark:text-[#FFFFFF]">
              Welcome to <span className="text-[#1B4332] dark:text-[#52B788] italic">MedCost.ai</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] max-w-lg mx-auto leading-relaxed">
              Transparent closed-form healthcare economics. Start your personalized clinical intake or explore instantly as a guest account.
            </p>
          </div>

          {/* The 2 Primary Options: New Patient Clinical Intake & Continue as Guest Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: New Patient Clinical Intake Card */}
            <button
              type="button"
              onClick={() => setViewMode('intake')}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-left hover:border-[#52B788]/60 shadow-card transition-all cursor-pointer flex flex-col justify-between group space-y-4 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] font-bold">
                  16 Steps
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#111827] dark:text-[#FFFFFF] group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                  New Patient Clinical Intake
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 leading-relaxed">
                  Interactive single-question onboarding flow with live BMI computation, blood pressure, and clinical risk tiering.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] dark:text-[#52B788] pt-2">
                <span>Start Health Intake</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Option 2: Continue as a Guest Account Card */}
            <button
              type="button"
              onClick={() => {
                loginAsGuest();
                if (onComplete) onComplete();
              }}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-left hover:border-[#52B788]/60 shadow-card transition-all cursor-pointer flex flex-col justify-between group space-y-4 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F5F0] dark:bg-[#121714] text-[#4B5563] dark:text-[#A8B5AC] flex items-center justify-center group-hover:text-[#52B788] group-hover:bg-[#E6EFEA] dark:group-hover:bg-[#133324] transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#6B7280] dark:text-[#9CA3AF]">
                  Instant Access
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#111827] dark:text-[#FFFFFF] group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                  Continue as a Guest Account
                </h3>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1.5 leading-relaxed">
                  Bypass login and explore all prediction, simulation, and analytics features using standard baseline parameters.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] dark:text-[#52B788] pt-2">
                <span>Enter as Guest</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Bottom Right: Discreet "You are a developer?" Button */}
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => {
                setViewMode('developer');
                setSelectedDev(null);
                setDevPin('');
                setDevError('');
                setDevSuccess(false);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#1B4332] dark:hover:text-[#52B788] bg-white/70 dark:bg-[#0F1412]/70 hover:bg-[#E6EFEA] dark:hover:bg-[#133324] border border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/60 transition-all cursor-pointer group shadow-2xs"
              title="Switch to Developer Portal"
            >
              <Code2 className="w-3.5 h-3.5 text-[#52B788] group-hover:scale-110 transition-transform" />
              <span>You are a developer?</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      )}

      {viewMode === 'developer' && (
        /* ================= 2. DEDICATED DEVELOPER PORTAL ================= */
        <div className="w-full max-w-2xl space-y-6 animate-in fade-in duration-300">
          
          {/* Top Bar with Back to Main Login */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => {
                setViewMode('welcome');
                setSelectedDev(null);
                setDevPin('');
                setDevError('');
              }}
              className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>

            <span className="text-[10px] font-mono uppercase text-[#1B4332] dark:text-[#52B788] font-bold">
              Developer Portal
            </span>
          </div>

          {/* Developer Quick-Login Box */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 sm:p-8 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#1F2622] pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#52B788]" />
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] dark:text-[#FFFFFF]">
                    Developer & Research Team Login
                  </h2>
                </div>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  Select your profile to authenticate with your personal developer PIN.
                </p>
              </div>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] font-bold">
                5 Team Profiles
              </span>
            </div>

            {/* 5 Developer Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEVELOPERS.map((dev) => (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => {
                    setSelectedDev(dev);
                    setDevPin('');
                    setDevError('');
                    setDevSuccess(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer group ${
                    selectedDev?.id === dev.id
                      ? 'bg-[#E6EFEA] dark:bg-[#133324] border-[#52B788] ring-2 ring-[#52B788]/50 shadow-xs'
                      : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/60 hover:bg-white dark:hover:bg-[#121714]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#1B4332] to-[#2D6A4F] text-[#52B788] ring-1 ring-[#52B788]/60 flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 group-hover:ring-[#52B788]">
                    {dev.initials}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="text-xs font-bold text-[#111827] dark:text-[#FFFFFF] group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] truncate flex items-center justify-between">
                      <span>{dev.name}</span>
                      <Key className="w-3 h-3 text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#52B788]" />
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                      {dev.role.split('&')[0].trim()}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* PIN Entry Drawer if developer is selected */}
            <AnimatePresence>
              {selectedDev && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <form 
                    onSubmit={handleDevLoginSubmit}
                    className="p-4 sm:p-5 rounded-2xl bg-[#E6EFEA]/80 dark:bg-[#133324]/40 border border-[#C5DFD3] dark:border-[#23583E] space-y-3 mt-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#52B788]" />
                        <span className="text-xs font-bold text-[#111827] dark:text-[#FFFFFF]">
                          Enter Developer PIN for {selectedDev.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDev(null)}
                        className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] text-xs cursor-pointer p-1"
                        aria-label="Close PIN prompt"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="password"
                        autoFocus
                        value={devPin}
                        onChange={(e) => {
                          setDevPin(e.target.value);
                          setDevError('');
                        }}
                        placeholder="Enter Developer PIN"
                        className="flex-grow px-4 py-2.5 rounded-xl bg-white dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-sm text-[#111827] dark:text-[#FFFFFF] focus:ring-2 focus:ring-[#52B788] outline-none"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] text-xs font-bold hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {devSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Verified!</span>
                          </>
                        ) : (
                          <>
                            <span>Login</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                    {devError && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{devError}</span>
                      </p>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}

      {viewMode === 'intake' && (
        /* ================= 3. INTAKE STEPPER MODE ================= */
        <div className="w-full max-w-2xl space-y-6">
          
          {/* Top Bar with Back to Welcome Portal */}
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setViewMode('welcome')}
              className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>

            <span className="text-[10px] font-mono uppercase text-[#1B4332] dark:text-[#52B788] font-bold">
              Personalized Patient Intake
            </span>
          </div>

          {/* Top Stepper Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#1B4332] dark:text-[#52B788] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#52B788]" />
                <span>Step {currentStep + 1} of {totalSteps}</span>
              </span>
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-semibold">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#E5E7EB] dark:bg-[#1A241E] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#1B4332] dark:bg-[#52B788]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Interactive Step Card */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 sm:p-10 shadow-elevated relative min-h-[420px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6 flex-grow flex flex-col justify-center"
            >
              {/* STEP 0: Full Name */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Personal Profile</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      What is your full name?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Your name will be associated with all generated actuarial prediction certificates.
                    </p>
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                    <input 
                      type="text"
                      autoFocus
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Lucky Gupta"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-lg font-medium focus:ring-2 focus:ring-[#52B788] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* STEP 1: Email Address */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Personal Profile</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      What is your email address?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Used for authentication and dispatching verified PDF medical expense audit reports.
                    </p>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                    <input 
                      type="email"
                      autoFocus
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. lucky.gupta@university.edu"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-lg font-medium focus:ring-2 focus:ring-[#52B788] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Address & Geographic Region */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Demographic Intake</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Where are you located?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Geographical region is a primary categorical regressor influencing healthcare cost indices.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] dark:text-[#9CA3AF]" />
                      <input 
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Street Address or City"
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-sm text-[#111827] dark:text-[#FFFFFF] focus:ring-2 focus:ring-[#52B788] outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                      {['Central', 'North', 'South', 'East', 'West'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData({ ...formData, region: r })}
                          className={`p-3 rounded-xl border text-xs font-bold uppercase font-mono transition-all cursor-pointer ${
                            formData.region === r 
                              ? 'bg-[#1B4332] dark:bg-[#133324] text-white dark:text-[#52B788] border-[#52B788] shadow-xs'
                              : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Role & Self-Description */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Personal Profile</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Describe your role or profession
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Tell us about yourself (e.g. Student, Software Engineer, Actuarial Analyst).
                    </p>
                  </div>
                  <div className="space-y-3">
                    <input 
                      type="text"
                      autoFocus
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      placeholder="e.g. BTech 2nd Year Student"
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-base font-medium focus:ring-2 focus:ring-[#52B788] outline-none transition-all"
                    />
                    <textarea 
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="A short description about yourself or research interests..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-xs sm:text-sm text-[#111827] dark:text-[#FFFFFF] focus:ring-2 focus:ring-[#52B788] outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Current Age */}
              {currentStep === 4 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 1/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      What is your age?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Age is a primary linear regressor (β ≈ +$40.35 per year of life).
                    </p>
                  </div>

                  <div className="py-6 space-y-4">
                    <div className="font-numeric text-6xl sm:text-7xl font-bold text-[#1B4332] dark:text-[#52B788]">
                      {formData.age} <span className="text-lg font-sans font-normal text-[#6B7280] dark:text-[#9CA3AF]">years</span>
                    </div>

                    <input 
                      type="range"
                      min={18}
                      max={85}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                      className="w-full max-w-md mx-auto h-2.5 bg-gray-200 dark:bg-[#1A241E] rounded-lg appearance-none cursor-pointer accent-[#52B788]"
                    />

                    <div className="flex justify-center gap-2 pt-2">
                      {[21, 30, 45, 60].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData({ ...formData, age: preset })}
                          className="px-3 py-1 rounded-lg text-xs font-mono bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788] cursor-pointer"
                        >
                          {preset} yrs
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Biological Sex */}
              {currentStep === 5 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 2/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      What is your biological sex?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Female is the reference baseline ($0.00). Male carries empirical weight in OLS.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-6">
                    {['Male', 'Female'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, sex: s });
                          handleNext();
                        }}
                        className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer ${
                          formData.sex === s
                            ? 'bg-[#E6EFEA] dark:bg-[#133324] border-[#52B788] text-[#1B4332] dark:text-[#52B788] shadow-card'
                            : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] border-[#E5E7EB] dark:border-[#1F2622] text-[#4B5563] dark:text-[#9CA3AF] hover:border-[#52B788]/40'
                        }`}
                      >
                        <User className="w-8 h-8" />
                        <span className="font-bold text-base">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 6: BMI Calculation */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1 text-center">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 3/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Body Mass Index (BMI)
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Adjust height and weight to automatically compute your clinical BMI index.
                    </p>
                  </div>

                  <div className="p-6 bg-[#F4F5F0] dark:bg-[#0A0D0B] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
                      <div>
                        <span className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF] uppercase block">Calculated BMI</span>
                        <div className="font-numeric text-4xl font-bold text-[#1B4332] dark:text-[#52B788]">{formData.bmi} <span className="text-xs text-gray-500 font-sans">kg/m²</span></div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBmiCategory(formData.bmi).color}`}>
                        {getBmiCategory(formData.bmi).label}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Height: {formData.heightCm} cm</span>
                        </div>
                        <input 
                          type="range"
                          min={140}
                          max={210}
                          value={formData.heightCm}
                          onChange={(e) => updateBmi(parseInt(e.target.value), formData.weightKg)}
                          className="w-full h-2 bg-gray-200 dark:bg-[#1A241E] rounded-lg appearance-none cursor-pointer accent-[#52B788]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Weight: {formData.weightKg} kg</span>
                        </div>
                        <input 
                          type="range"
                          min={40}
                          max={150}
                          value={formData.weightKg}
                          onChange={(e) => updateBmi(formData.heightCm, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-[#1A241E] rounded-lg appearance-none cursor-pointer accent-[#52B788]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Smoking Status */}
              {currentStep === 7 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 4/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      What is your tobacco status?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Smoking carries one of the largest positive regression weights in insurance underwriting.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 max-w-lg mx-auto">
                    {[
                      { id: 'Never', label: 'Never Smoked', desc: 'Reference baseline ($0.00)' },
                      { id: 'Former', label: 'Former Smoker', desc: 'Cessation verified' },
                      { id: 'Current', label: 'Active Smoker', desc: 'Highest risk attribution' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, smoker: item.id });
                          handleNext();
                        }}
                        className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.smoker === item.id
                            ? 'bg-[#E6EFEA] dark:bg-[#133324] border-[#52B788] text-[#1B4332] dark:text-[#52B788] shadow-card'
                            : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] border-[#E5E7EB] dark:border-[#1F2622] text-[#4B5563] dark:text-[#9CA3AF] hover:border-[#52B788]/40'
                        }`}
                      >
                        <span className="font-bold text-sm block">{item.label}</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 8: Systolic Blood Pressure */}
              {currentStep === 8 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 5/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Resting Systolic Blood Pressure
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Clinical hemodynamic marker of cardiovascular risk in Model B.
                    </p>
                  </div>

                  <div className="py-6 space-y-4">
                    <div className="font-numeric text-6xl sm:text-7xl font-bold text-[#1B4332] dark:text-[#52B788]">
                      {formData.systolic_bp} <span className="text-lg font-sans font-normal text-[#6B7280] dark:text-[#9CA3AF]">mmHg</span>
                    </div>

                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getBpCategory(formData.systolic_bp).color}`}>
                      {getBpCategory(formData.systolic_bp).label}
                    </span>

                    <input 
                      type="range"
                      min={90}
                      max={180}
                      value={formData.systolic_bp}
                      onChange={(e) => setFormData({ ...formData, systolic_bp: parseInt(e.target.value) })}
                      className="w-full max-w-md mx-auto h-2.5 bg-gray-200 dark:bg-[#1A241E] rounded-lg appearance-none cursor-pointer accent-[#52B788]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 9: HbA1c Glycemic Marker */}
              {currentStep === 9 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 6/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      HbA1c Blood Glucose (%)
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Glycated hemoglobin percentage reflecting 3-month glycemic stability.
                    </p>
                  </div>

                  <div className="py-6 space-y-4">
                    <div className="font-numeric text-6xl sm:text-7xl font-bold text-[#1B4332] dark:text-[#52B788]">
                      {formData.hba1c}%
                    </div>

                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getHba1cCategory(formData.hba1c).color}`}>
                      {getHba1cCategory(formData.hba1c).label}
                    </span>

                    <input 
                      type="range"
                      min={4.0}
                      max={12.0}
                      step={0.1}
                      value={formData.hba1c}
                      onChange={(e) => setFormData({ ...formData, hba1c: parseFloat(e.target.value) })}
                      className="w-full max-w-md mx-auto h-2.5 bg-gray-200 dark:bg-[#1A241E] rounded-lg appearance-none cursor-pointer accent-[#52B788]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 10: Dependents / Children */}
              {currentStep === 10 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 7/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Covered Children & Dependents
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Number of minor dependents included on this health insurance policy.
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 py-8">
                    {[0, 1, 2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, dependents: count });
                          handleNext();
                        }}
                        className={`w-14 h-14 rounded-2xl border-2 font-numeric text-xl font-bold transition-all cursor-pointer flex items-center justify-center ${
                          formData.dependents === count
                            ? 'bg-[#1B4332] dark:bg-[#133324] text-white dark:text-[#52B788] border-[#52B788] shadow-md scale-105'
                            : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/40'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 11: Doctor Consultations Last Year */}
              {currentStep === 11 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 8/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Doctor Visits in the Past Year
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Annual outpatient clinical consultations (physician visits).
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 py-8">
                    {[0, 1, 2, 3, 4, 5, 8].map((visits) => (
                      <button
                        key={visits}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, visits_last_year: visits });
                          handleNext();
                        }}
                        className={`w-14 h-14 rounded-2xl border-2 font-numeric text-xl font-bold transition-all cursor-pointer flex items-center justify-center ${
                          formData.visits_last_year === visits
                            ? 'bg-[#1B4332] dark:bg-[#133324] text-white dark:text-[#52B788] border-[#52B788] shadow-md scale-105'
                            : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/40'
                        }`}
                      >
                        {visits}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 12: Inpatient Hospitalizations (Past 3 Years) */}
              {currentStep === 12 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 9/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Hospitalizations in Past 3 Years
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Hospital admissions carry the largest marginal cost weight (β ≈ +$1,928.25 each).
                    </p>
                  </div>

                  <div className="flex justify-center gap-4 py-8 max-w-sm mx-auto">
                    {[0, 1, 2, 3].map((hosp) => (
                      <button
                        key={hosp}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, hospitalizations_last_3yrs: hosp });
                          handleNext();
                        }}
                        className={`flex-1 py-4 rounded-2xl border-2 font-numeric text-2xl font-bold transition-all cursor-pointer flex items-center justify-center ${
                          formData.hospitalizations_last_3yrs === hosp
                            ? 'bg-[#1B4332] dark:bg-[#133324] text-white dark:text-[#52B788] border-[#52B788] shadow-md scale-105'
                            : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/40'
                        }`}
                      >
                        {hosp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 13: Chronic Health Conditions */}
              {currentStep === 13 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 10/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Pre-existing Chronic Conditions
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Select all chronic health conditions you currently manage.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-4 max-w-md mx-auto">
                    {['Hypertension', 'Type 2 Diabetes', 'Asthma', 'None'].map((cond) => {
                      const isSelected = formData.chronic_conditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            if (cond === 'None') {
                              setFormData({ ...formData, chronic_conditions: ['None'] });
                            } else {
                              const filtered = formData.chronic_conditions.filter(c => c !== 'None');
                              if (isSelected) {
                                const remaining = filtered.filter(c => c !== cond);
                                setFormData({ ...formData, chronic_conditions: remaining.length ? remaining : ['None'] });
                              } else {
                                setFormData({ ...formData, chronic_conditions: [...filtered, cond] });
                              }
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#E6EFEA] dark:bg-[#133324] border-[#52B788] text-[#1B4332] dark:text-[#52B788] font-bold shadow-xs'
                              : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] border-[#E5E7EB] dark:border-[#1F2622] text-[#4B5563] dark:text-[#9CA3AF]'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 14: Preferred Insurance Plan Structure */}
              {currentStep === 14 && (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Actuarial Parameter 11/11</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Insurance Plan Architecture
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      HMO is the baseline category ($0.00). PPO and EPO offer broader network flexibilities.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 max-w-lg mx-auto">
                    {['HMO', 'PPO', 'EPO', 'POS'].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, plan_type: plan });
                          handleNext();
                        }}
                        className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          formData.plan_type === plan
                            ? 'bg-[#1B4332] dark:bg-[#133324] text-white dark:text-[#52B788] border-[#52B788] shadow-md scale-105'
                            : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#52B788]/40'
                        }`}
                      >
                        <span className="font-bold text-base block">{plan}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 block">Network Tier</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 15: Review & Confirmation */}
              {currentStep === 15 && (
                <div className="space-y-4">
                  <div className="space-y-1 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">Profile Configured</span>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#111827] dark:text-[#FFFFFF]">
                      Welcome, {formData.name || 'Member'}!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                      Your patient covariates and actuarial parameters have been recorded.
                    </p>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-4 rounded-2xl bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Age</span>
                      <strong className="font-numeric">{formData.age} yrs</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Biological Sex</span>
                      <strong className="font-numeric">{formData.sex}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">BMI</span>
                      <strong className="font-numeric">{formData.bmi} kg/m²</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Tobacco</span>
                      <strong className="font-numeric">{formData.smoker}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Blood Pressure</span>
                      <strong className="font-numeric">{formData.systolic_bp} mmHg</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Plan Type</span>
                      <strong className="font-numeric">{formData.plan_type}</strong>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleFinish('estimator')}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] font-bold text-xs sm:text-sm hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Compute My Estimated Cost</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFinish('dashboard')}
                      className="py-3.5 px-5 rounded-xl bg-[#F4F5F0] dark:bg-[#1A241E] text-[#111827] dark:text-[#FFFFFF] border border-[#E5E7EB] dark:border-[#1F2622] font-semibold text-xs sm:text-sm hover:bg-[#E6EFEA] transition-all cursor-pointer"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Stepper Navigation Controls */}
          {currentStep < totalSteps - 1 && (
            <div className="pt-6 border-t border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] text-xs font-bold hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          </div>
        </div>
      )}
    </div>
  );
}
