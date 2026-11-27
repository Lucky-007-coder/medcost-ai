import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, RotateCcw, AlertTriangle, Sparkles, 
  ChevronRight, CheckCircle2, FileText, Stethoscope, 
  MapPin, Activity, Calendar, Shield, HeartPulse
} from 'lucide-react';

export default function PredictionForm({ 
  selectedModel, 
  formData, 
  setFormData, 
  onSubmit, 
  isLoading, 
  validationErrors 
}) {
  const isModelB = selectedModel === 'model_b';

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNumericChange = (field, value) => {
    const num = value === '' ? '' : Number(value);
    setFormData((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  // Sample Profile Quick Selectors for fast testing and viva demonstration
  const loadPreset = (presetType) => {
    if (presetType === 'healthy_young') {
      setFormData({
        model_type: selectedModel,
        age: 24,
        sex: 'Female',
        bmi: 22.4,
        dependents: 0,
        smoker: 'Never',
        region: 'Central',
        income: 48000,
        systolic_bp: 115,
        hba1c: 5.1,
        visits_last_year: 1,
        hospitalizations_last_3yrs: 0,
        chronic_count: 0,
        deductible: 1000,
        plan_type: 'HMO',
      });
    } else if (presetType === 'smoker_profile') {
      setFormData({
        model_type: selectedModel,
        age: 38,
        sex: 'Male',
        bmi: 29.8,
        dependents: 1,
        smoker: 'Current',
        region: 'North',
        income: 62000,
        systolic_bp: 135,
        hba1c: 5.7,
        visits_last_year: 4,
        hospitalizations_last_3yrs: 1,
        chronic_count: 1,
        deductible: 1500,
        plan_type: 'PPO',
      });
    } else if (presetType === 'senior_chronic') {
      setFormData({
        model_type: selectedModel,
        age: 62,
        sex: 'Female',
        bmi: 33.5,
        dependents: 0,
        smoker: 'Former',
        region: 'South',
        income: 75000,
        systolic_bp: 148,
        hba1c: 7.2,
        visits_last_year: 6,
        hospitalizations_last_3yrs: 2,
        chronic_count: 3,
        deductible: 2000,
        plan_type: 'PPO',
      });
    }
  };

  const handleReset = () => {
    setFormData({
      model_type: selectedModel,
      age: 35,
      sex: 'Female',
      bmi: 26.0,
      dependents: 1,
      smoker: 'Never',
      region: 'Central',
      income: 55000,
      systolic_bp: 120,
      hba1c: 5.4,
      visits_last_year: 2,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      deductible: 1000,
      plan_type: 'HMO',
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      
      {/* Quick Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] shadow-xs">
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-[#111827] dark:text-[#FFFFFF] font-sans">
          <Sparkles className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
          <span className="font-semibold font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">Quick Demo Profiles:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadPreset('healthy_young')}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#E6EFEA] dark:bg-[#1B4332]/50 hover:bg-[#d6e8dd] dark:hover:bg-[#1B4332]/80 border border-[#CBE0D4] dark:border-[#1F2622] text-[#1B4332] dark:text-[#52B788] transition-colors cursor-pointer"
          >
            Healthy Young (Reference Baseline)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('smoker_profile')}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#FBFBFA] dark:bg-[#0F1412] hover:bg-[#F2D8C9]/50 dark:hover:bg-[#283b31] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Current Smoker (38y)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('senior_chronic')}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#FBFBFA] dark:bg-[#0F1412] hover:bg-[#E6EFEA] dark:hover:bg-[#283b31] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] transition-colors cursor-pointer"
          >
            Senior with Chronic Conditions
          </button>
        </div>
      </div>

      {/* Backend Validation Errors Banner */}
      {validationErrors && validationErrors.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-sm space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>Validation Errors Reported by API:</span>
          </div>
          <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 text-rose-700 dark:text-rose-400 pl-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 1: CORE DEMOGRAPHIC INPUTS */}
      <div className="space-y-3">
        {/* Category Pill Badges (Image 3 Style) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] shadow-xs">
            <FileText className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788]" />
            <span>Demographics</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] shadow-xs">
            <Stethoscope className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Lifestyle / Smoker</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#95D5B2]" />
            <span>Geographic Region</span>
          </span>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#1F2622]">
            <div>
              <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
                Parameters 1 to 6
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-0.5 font-sans">
                Core Demographic & Lifestyle Factors
              </h3>
              <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">
                Required by both Model A (Basic) and Model B (Clinical)
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-numeric font-bold bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              6 Core Inputs
            </span>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Age */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
              <label htmlFor="input-age" className="font-semibold font-sans">Age (Years)</label>
              <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.age} yrs</span>
            </div>
            <input
              id="input-age"
              type="number"
              min="0"
              max="100"
              value={formData.age}
              onChange={(e) => handleNumericChange('age', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
              required
            />
            <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Dataset bounds: 0 to 100 years</p>
          </div>

          {/* Sex */}
          <div className="space-y-1.5">
            <label htmlFor="input-sex" className="block text-sm sm:text-base font-semibold text-[#111827] dark:text-[#FFFFFF] font-sans">
              Biological Sex
            </label>
            <select
              id="input-sex"
              value={formData.sex}
              onChange={(e) => handleChange('sex', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all cursor-pointer"
            >
              <option value="Female">Female (Reference Baseline)</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            <p className="text-[12px] text-[#1B4332] dark:text-[#52B788] font-medium">Reference: Female (+$0.00 base)</p>
          </div>

          {/* BMI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
              <label htmlFor="input-bmi" className="font-semibold font-sans">Body Mass Index (BMI)</label>
              <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.bmi} kg/m²</span>
            </div>
            <input
              id="input-bmi"
              type="number"
              step="0.1"
              min="10"
              max="60"
              value={formData.bmi}
              onChange={(e) => handleNumericChange('bmi', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
              required
            />
            <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Normal: 18.5–24.9 | Sample mean: 27.0</p>
          </div>

          {/* Dependents */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
              <label htmlFor="input-dependents" className="font-semibold font-sans">Number of Dependents</label>
              <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.dependents}</span>
            </div>
            <input
              id="input-dependents"
              type="number"
              min="0"
              max="7"
              value={formData.dependents}
              onChange={(e) => handleNumericChange('dependents', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
              required
            />
            <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Covered children or dependents: 0 to 7</p>
          </div>

          {/* Smoking Status */}
          <div className="space-y-1.5">
            <label htmlFor="input-smoker" className="block text-sm sm:text-base font-semibold text-[#111827] dark:text-[#FFFFFF] font-sans">
              Smoking Status
            </label>
            <select
              id="input-smoker"
              value={formData.smoker}
              onChange={(e) => handleChange('smoker', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all cursor-pointer font-medium"
            >
              <option value="Never">Never Smoked (Reference Baseline)</option>
              <option value="Former">Former Smoker</option>
              <option value="Current">Current Smoker</option>
            </select>
            <p className="text-[12px] text-[#1B4332] dark:text-[#52B788] font-medium">Reference: Never (+$0.00 base)</p>
          </div>

          {/* Region */}
          <div className="space-y-1.5">
            <label htmlFor="input-region" className="block text-sm sm:text-base font-semibold text-[#111827] dark:text-[#FFFFFF] font-sans">
              Geographic Region
            </label>
            <select
              id="input-region"
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all cursor-pointer"
            >
              <option value="Central">Central (Reference Baseline)</option>
              <option value="East">East</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="West">West</option>
            </select>
            <p className="text-[12px] text-[#1B4332] dark:text-[#52B788] font-medium">Reference: Central (+$0.00 base)</p>
          </div>

        </div>
        </div>
      </div>

      {/* SECTION 2: CLINICAL & POLICY INPUTS (Model B Only) */}
      <AnimatePresence>
        {isModelB && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Category Pill Badges (Image 3 Style) */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] shadow-xs">
                <HeartPulse className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788]" />
                <span>Clinical Biomarkers</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-[#52B788]" />
                <span>3-Year Utilization</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] shadow-xs">
                <Shield className="w-3.5 h-3.5 text-[#2D6A4F] dark:text-[#95D5B2]" />
                <span>Coverage Policy</span>
              </span>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#1F2622]">
              <div>
                <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
                  Parameters 7 to 14 • Model B Exclusive
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-0.5 font-sans">
                  Clinical Intake, Utilization & Policy Parameters
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">
                  Pre-policy health biometrics, prior hospital admissions, and deductible selection
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-numeric font-bold bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000]">
                8 Clinical Inputs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Income */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-income" className="font-semibold font-sans">Annual Income ($)</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">
                    ${formData.income ? Number(formData.income).toLocaleString() : '0'}
                  </span>
                </div>
                <input
                  id="input-income"
                  type="number"
                  min="0"
                  max="1200000"
                  step="1000"
                  value={formData.income}
                  onChange={(e) => handleNumericChange('income', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
                  required
                />
                <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Range: $1,100 to $1,061,800</p>
              </div>

              {/* Systolic BP */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-bp" className="font-semibold font-sans">Systolic BP (mmHg)</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.systolic_bp}</span>
                </div>
                <input
                  id="input-bp"
                  type="number"
                  min="60"
                  max="200"
                  value={formData.systolic_bp}
                  onChange={(e) => handleNumericChange('systolic_bp', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
                  required
                />
                <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Normal: &lt;120 | Elevated: 120-129</p>
              </div>

              {/* HbA1c */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-hba1c" className="font-semibold font-sans">HbA1c Level (%)</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.hba1c}%</span>
                </div>
                <input
                  id="input-hba1c"
                  type="number"
                  step="0.1"
                  min="3.0"
                  max="14.0"
                  value={formData.hba1c}
                  onChange={(e) => handleNumericChange('hba1c', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
                  required
                />
                <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Normal: &lt;5.7% | Diabetic: &ge;6.5%</p>
              </div>

              {/* Visits Last Year */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-visits" className="font-semibold font-sans">Doctor Visits (1y)</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.visits_last_year}</span>
                </div>
                <input
                  id="input-visits"
                  type="number"
                  min="0"
                  max="20"
                  value={formData.visits_last_year}
                  onChange={(e) => handleNumericChange('visits_last_year', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
                  required
                />
                <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">β = +$137.20 / consultation</p>
              </div>

              {/* Hospitalizations Last 3 Years */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-hosp" className="font-semibold font-sans">Hospitalizations (3y)</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.hospitalizations_last_3yrs}</span>
                </div>
                <input
                  id="input-hosp"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.hospitalizations_last_3yrs}
                  onChange={(e) => handleNumericChange('hospitalizations_last_3yrs', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
                  required
                />
                <p className="text-[12px] text-[#1B4332] dark:text-[#52B788] font-bold">β = +$1,928.25 / admission</p>
              </div>

              {/* Chronic Conditions Count */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-chronic" className="font-semibold font-sans">Chronic Conditions</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">{formData.chronic_count}</span>
                </div>
                <input
                  id="input-chronic"
                  type="number"
                  min="0"
                  max="8"
                  value={formData.chronic_count}
                  onChange={(e) => handleNumericChange('chronic_count', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all"
                  required
                />
                <p className="text-[12px] text-[#1B4332] dark:text-[#52B788] font-bold">β = +$926.66 / condition</p>
              </div>

              {/* Deductible */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm sm:text-base text-[#111827] dark:text-[#FFFFFF]">
                  <label htmlFor="input-deductible" className="font-semibold font-sans">Deductible ($)</label>
                  <span className="font-numeric text-[#1B4332] dark:text-[#52B788] font-bold text-base">
                    ${formData.deductible ? Number(formData.deductible).toLocaleString() : '0'}
                  </span>
                </div>
                <select
                  id="input-deductible"
                  value={formData.deductible}
                  onChange={(e) => handleNumericChange('deductible', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all cursor-pointer"
                >
                  <option value={500}>$500 Deductible</option>
                  <option value={1000}>$1,000 Deductible</option>
                  <option value={1500}>$1,500 Deductible</option>
                  <option value={2000}>$2,000 Deductible</option>
                  <option value={2500}>$2,500 Deductible</option>
                  <option value={5000}>$5,000 Deductible</option>
                </select>
                <p className="text-[12px] text-[#4B5563] dark:text-[#9CA3AF]">Annual out-of-pocket threshold</p>
              </div>

              {/* Plan Type */}
              <div className="space-y-1.5">
                <label htmlFor="input-plan" className="block text-sm sm:text-base font-semibold text-[#111827] dark:text-[#FFFFFF] font-sans">
                  Coverage Plan Type
                </label>
                <select
                  id="input-plan"
                  value={formData.plan_type}
                  onChange={(e) => handleChange('plan_type', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] transition-all cursor-pointer"
                >
                  <option value="HMO">HMO (Reference Baseline)</option>
                  <option value="PPO">PPO Plan</option>
                  <option value="EPO">EPO Plan</option>
                  <option value="POS">POS Plan</option>
                </select>
                <p className="text-[12px] text-[#1B4332] dark:text-[#52B788] font-medium">Reference: HMO (+$0.00 base)</p>
              </div>

            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Form Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622]">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#080B09] hover:bg-[#E6EFEA] dark:hover:bg-[#161D19] text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] text-sm sm:text-base font-semibold transition-all disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Form Fields</span>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-xl bg-[#1B4332] dark:bg-[#52B788] hover:bg-[#112D22] dark:hover:bg-[#40916C] text-white dark:text-[#000000] text-base font-semibold transition-all shadow-card hover:shadow-elevated disabled:opacity-50 cursor-pointer"
        >
          <Calculator className={`w-5 h-5 text-[#52B788] dark:text-[#000000] ${isLoading ? 'animate-spin' : ''}`} />
          <span className="font-numeric font-bold tracking-wide">
            {isLoading ? 'Computing OLS Dot Product...' : `Calculate Estimated ${selectedModel === 'model_b' ? 'Clinical' : 'Basic'} Charges`}
          </span>
          <ChevronRight className="w-4 h-4 text-[#52B788] dark:text-[#000000]" />
        </button>
      </div>

    </form>
  );
}
