import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, RotateCcw, TrendingUp, TrendingDown, Minus, 
  ArrowRight, FileDown, CheckCircle2, AlertCircle, Info, Sparkles, User, History,
  Activity, ShieldAlert, HeartPulse, Check
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { predictCharges, getHistory, exportPredictionPdf } from '../../services/api';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

const PRESET_PERSONAS = [
  {
    id: 'healthy_adult',
    name: 'Young Healthy Non-Smoker',
    description: 'Age 26, BMI 22.4, never smoked, zero chronic conditions',
    data: {
      model_type: 'model_b',
      age: 26,
      sex: 'Female',
      bmi: 22.4,
      dependents: 0,
      smoker: 'Never',
      region: 'Central',
      income: 52000,
      systolic_bp: 115,
      hba1c: 5.1,
      visits_last_year: 1,
      hospitalizations_last_3yrs: 0,
      chronic_count: 0,
      deductible: 1500,
      plan_type: 'PPO'
    }
  },
  {
    id: 'smoker_hypertensive',
    name: 'Middle-Aged Smoker (At-Risk)',
    description: 'Age 48, BMI 31.2, active smoker, hypertension risk profile',
    data: {
      model_type: 'model_b',
      age: 48,
      sex: 'Male',
      bmi: 31.2,
      dependents: 2,
      smoker: 'Current',
      region: 'South',
      income: 68000,
      systolic_bp: 142,
      hba1c: 6.2,
      visits_last_year: 4,
      hospitalizations_last_3yrs: 1,
      chronic_count: 2,
      deductible: 1000,
      plan_type: 'HMO'
    }
  },
  {
    id: 'senior_chronic',
    name: 'Senior Multi-Chronic Profile',
    description: 'Age 64, BMI 28.5, former smoker, 3 chronic conditions',
    data: {
      model_type: 'model_b',
      age: 64,
      sex: 'Female',
      bmi: 28.5,
      dependents: 1,
      smoker: 'Former',
      region: 'East',
      income: 45000,
      systolic_bp: 135,
      hba1c: 6.8,
      visits_last_year: 6,
      hospitalizations_last_3yrs: 2,
      chronic_count: 3,
      deductible: 750,
      plan_type: 'POS'
    }
  }
];

export default function SimulatorView({ onNavigateToEstimator }) {
  // Original Baseline Profile
  const [baselineInputs, setBaselineInputs] = useState(PRESET_PERSONAS[1].data);
  const [originalResult, setOriginalResult] = useState(null);

  // Simulated (Modified) Profile
  const [simulatedInputs, setSimulatedInputs] = useState(PRESET_PERSONAS[1].data);
  const [simulatedResult, setSimulatedResult] = useState(null);

  // UI state
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const debounceTimerRef = useRef(null);

  // Fetch initial prediction for baseline
  useEffect(() => {
    let isMounted = true;
    setIsLoadingOriginal(true);
    predictCharges(baselineInputs)
      .then(res => {
        if (isMounted) {
          setOriginalResult(res);
          setSimulatedResult(res);
          setIsLoadingOriginal(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoadingOriginal(false);
        }
      });

    // Also fetch recent history records for the selector
    getHistory({ limit: 15 })
      .then(data => {
        if (isMounted && data.records) {
          setHistoryRecords(data.records);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // Trigger debounced prediction when simulatedInputs change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSimulating(true);
    setValidationError(null);

    debounceTimerRef.current = setTimeout(() => {
      predictCharges(simulatedInputs)
        .then(res => {
          setSimulatedResult(res);
          setIsSimulating(false);
        })
        .catch(err => {
          setIsSimulating(false);
          const msg = err.response?.data?.details?.[0] || err.message || 'Simulation validation error.';
          setValidationError(msg);
        });
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [simulatedInputs]);

  // Handle Input Changes
  const handleSliderChange = (field, value) => {
    setSimulatedInputs(prev => ({
      ...prev,
      [field]: Number(value)
    }));
  };

  const handleSelectChange = (field, value) => {
    setSimulatedInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset to Baseline
  const handleResetToBaseline = () => {
    setSimulatedInputs({ ...baselineInputs });
  };

  // Load a Persona Preset
  const handleLoadPersona = (persona) => {
    setBaselineInputs({ ...persona.data });
    setSimulatedInputs({ ...persona.data });
    setIsLoadingOriginal(true);
    predictCharges(persona.data)
      .then(res => {
        setOriginalResult(res);
        setSimulatedResult(res);
        setIsLoadingOriginal(false);
      })
      .catch(() => setIsLoadingOriginal(false));
  };

  // Load a Saved History Record
  const handleSelectHistoryRecord = (rec) => {
    const rawParams = rec.input_parameters || {};
    const formatted = {
      model_type: rec.model_type || 'model_b',
      age: rawParams.age ?? 40,
      sex: rawParams.sex || 'Male',
      bmi: rawParams.bmi ?? 28.0,
      dependents: rawParams.dependents ?? 1,
      smoker: rawParams.smoker || 'Never',
      region: rawParams.region || 'Central',
      income: rawParams.income ?? 55000,
      systolic_bp: rawParams.systolic_bp ?? 120,
      hba1c: rawParams.hba1c ?? 5.5,
      visits_last_year: rawParams.visits_last_year ?? 2,
      hospitalizations_last_3yrs: rawParams.hospitalizations_last_3yrs ?? 0,
      chronic_count: rawParams.chronic_count ?? 0,
      deductible: rawParams.deductible ?? 1000,
      plan_type: rawParams.plan_type || 'HMO'
    };

    setBaselineInputs(formatted);
    setSimulatedInputs(formatted);
    setShowHistoryModal(false);

    setIsLoadingOriginal(true);
    predictCharges(formatted)
      .then(res => {
        setOriginalResult(res);
        setSimulatedResult(res);
        setIsLoadingOriginal(false);
      })
      .catch(() => setIsLoadingOriginal(false));
  };

  // Download PDF Report of the Simulation
  const handleDownloadReport = async () => {
    if (!simulatedResult) return;
    setIsExportingPdf(true);
    try {
      await exportPredictionPdf(simulatedResult);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Financial Deltas
  const originalCost = originalResult?.predicted_annual_cost ?? 0;
  const simulatedCost = simulatedResult?.predicted_annual_cost ?? 0;
  const deltaDollars = simulatedCost - originalCost;
  const deltaPercent = originalCost > 0 ? (deltaDollars / originalCost) * 100 : 0;

  // Smooth Animated Counters for Live Output & Delta
  const animatedSimulatedCost = useAnimatedCounter(simulatedCost, { duration: 380, decimals: 2, prefix: '$' });
  const animatedDeltaDollars = useAnimatedCounter(Math.abs(deltaDollars), { duration: 380, decimals: 2, prefix: '$' });

  // Differences Detection
  const modifiedFields = useMemo(() => {
    const diffs = [];
    Object.keys(simulatedInputs).forEach(k => {
      if (simulatedInputs[k] !== baselineInputs[k] && k !== 'model_type') {
        diffs.push({
          key: k,
          original: baselineInputs[k],
          simulated: simulatedInputs[k]
        });
      }
    });
    return diffs;
  }, [simulatedInputs, baselineInputs]);

  // Chart Data for Side-by-Side Visual Comparison
  const chartData = [
    { name: 'Baseline', cost: originalCost, fill: '#1B4332' },
    { name: 'Simulated', cost: simulatedCost, fill: deltaDollars <= 0 ? '#52B788' : '#E29578' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans pb-28 lg:pb-16 transition-colors duration-200">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Interactive Actuarial Sandbox</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-1">
            What-If Cost Simulator
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] max-w-2xl mt-1">
            Adjust lifestyle habits, biometrics, and policy variables. Watch simulated costs and exact dollar variance update in real time on the right of the screen.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] hover:border-[#1B4332] dark:hover:border-[#52B788] transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788]" />
            <span>Load Past Record</span>
          </button>

          <button
            type="button"
            onClick={handleResetToBaseline}
            disabled={modifiedFields.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer ${
              modifiedFields.length > 0
                ? 'bg-white dark:bg-[#0F1412] border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] hover:bg-[#F4F5F0] dark:hover:bg-[#121714]'
                : 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ({modifiedFields.length})</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={isExportingPdf || !simulatedResult}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] hover:bg-[#2D6A4F] dark:hover:bg-[#95D5B2] transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SIMULATOR GRID */}
      {/* LEFT COLUMN: Controls & Sliders (7 cols) | RIGHT COLUMN: Sticky Real-Time Cost Change (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT COLUMN: INPUT CONTROLS ================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* Quick Baseline Profiles */}
          <div className="bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#CBE0D4] dark:border-[#1F2622] rounded-3xl p-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select Baseline Persona</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_PERSONAS.map(p => {
                const isActive = baselineInputs.age === p.data.age && baselineInputs.smoker === p.data.smoker && baselineInputs.chronic_count === p.data.chronic_count;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleLoadPersona(p)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-[#0F1412] border-[#1B4332] dark:border-[#52B788] shadow-xs ring-2 ring-[#52B788]/40'
                        : 'bg-white/80 dark:bg-[#0F1412]/60 border-[#E5E7EB] dark:border-[#1F2622] hover:bg-white dark:hover:bg-[#161D19] hover:border-[#1B4332]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#111827] dark:text-[#FFFFFF]">{p.name}</h4>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788] flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] mt-1 leading-snug line-clamp-2">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel A: Demographics & Lifestyle Controls */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#111827] dark:text-[#FFFFFF] flex items-center gap-2">
                <User className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                <span>Demographic & Lifestyle Controls</span>
              </h3>
              <span className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] font-mono">Covariates</span>
            </div>

            {/* Age Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Age (Years)</label>
                <span className="font-numeric font-bold text-xs sm:text-sm text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#CBE0D4] dark:border-[#1F2622]">
                  {simulatedInputs.age} yrs
                </span>
              </div>
              <input 
                type="range"
                min="18"
                max="85"
                step="1"
                value={simulatedInputs.age}
                onChange={(e) => handleSliderChange('age', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788]"
              />
              <div className="flex justify-between text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">
                <span>18 yrs</span>
                <span>Marginal slope: +$40.35/yr</span>
                <span>85 yrs</span>
              </div>
            </div>

            {/* BMI Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Body Mass Index (BMI)</label>
                <span className="font-numeric font-bold text-xs sm:text-sm text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#CBE0D4] dark:border-[#1F2622]">
                  {simulatedInputs.bmi.toFixed(1)} kg/m²
                </span>
              </div>
              <input 
                type="range"
                min="15.0"
                max="52.0"
                step="0.1"
                value={simulatedInputs.bmi}
                onChange={(e) => handleSliderChange('bmi', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788]"
              />
              <div className="flex justify-between text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">
                <span>15.0 (Underweight)</span>
                <span>25.0 (Normal)</span>
                <span>30.0 (Obese)</span>
                <span>52.0</span>
              </div>
            </div>

            {/* Smoking Status Segmented Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#111827] dark:text-[#FFFFFF]">
                Smoking Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Never', 'Former', 'Current'].map((st) => {
                  const isSelected = simulatedInputs.smoker === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleSelectChange('smoker', st)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] border-[#1B4332] dark:border-[#52B788] shadow-xs'
                          : 'bg-white dark:bg-[#080B09] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622] hover:bg-gray-50 dark:hover:bg-[#161D19]'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
                Current smoking adds an estimated <b>+$2,148.90/yr</b> linear differential over never-smokers.
              </p>
            </div>

            {/* Sex & Dependents */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827] dark:text-[#FFFFFF]">Biological Sex</label>
                <select
                  value={simulatedInputs.sex}
                  onChange={(e) => handleSelectChange('sex', e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#080B09] text-[#111827] dark:text-[#FFFFFF] focus:ring-1 focus:ring-[#52B788]"
                >
                  <option value="Female">Female (Baseline $0.00)</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Dependents</label>
                  <span className="font-numeric font-bold text-xs text-[#1B4332] dark:text-[#52B788]">
                    {simulatedInputs.dependents}
                  </span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={simulatedInputs.dependents}
                  onChange={(e) => handleSliderChange('dependents', e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788] mt-2"
                />
              </div>
            </div>

            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827] dark:text-[#FFFFFF]">Geographic Region</label>
              <select
                value={simulatedInputs.region}
                onChange={(e) => handleSelectChange('region', e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#080B09] text-[#111827] dark:text-[#FFFFFF] focus:ring-1 focus:ring-[#52B788]"
              >
                <option value="Central">Central (Reference Baseline)</option>
                <option value="East">East</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          {/* Panel B: Clinical History & Policy Controls */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#111827] dark:text-[#FFFFFF] flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                <span>Clinical History & Policy Controls</span>
              </h3>
              <span className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] font-mono">Model B Inputs</span>
            </div>

            {/* Chronic Conditions Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Diagnosed Chronic Conditions Count</label>
                <span className="font-numeric font-bold text-xs sm:text-sm text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#CBE0D4] dark:border-[#1F2622]">
                  {simulatedInputs.chronic_count} condition{simulatedInputs.chronic_count === 1 ? '' : 's'}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="6"
                step="1"
                value={simulatedInputs.chronic_count}
                onChange={(e) => handleSliderChange('chronic_count', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788]"
              />
              <div className="flex justify-between text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">
                <span>0 (None)</span>
                <span>Marginal slope: +$980.50/condition</span>
                <span>6+</span>
              </div>
            </div>

            {/* Hospitalizations Past 3 Years Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Inpatient Hospitalizations (Last 3 Yrs)</label>
                <span className="font-numeric font-bold text-xs sm:text-sm text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#CBE0D4] dark:border-[#1F2622]">
                  {simulatedInputs.hospitalizations_last_3yrs} stay{simulatedInputs.hospitalizations_last_3yrs === 1 ? '' : 's'}
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="8"
                step="1"
                value={simulatedInputs.hospitalizations_last_3yrs}
                onChange={(e) => handleSliderChange('hospitalizations_last_3yrs', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788]"
              />
              <div className="flex justify-between text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">
                <span>0</span>
                <span>Slope: +$745.20/hospitalization</span>
                <span>8</span>
              </div>
            </div>

            {/* Systolic BP Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Systolic Blood Pressure</label>
                <span className="font-numeric font-bold text-xs sm:text-sm text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#CBE0D4] dark:border-[#1F2622]">
                  {simulatedInputs.systolic_bp} mmHg
                </span>
              </div>
              <input 
                type="range"
                min="90"
                max="190"
                step="1"
                value={simulatedInputs.systolic_bp}
                onChange={(e) => handleSliderChange('systolic_bp', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788]"
              />
              <div className="flex justify-between text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">
                <span>90 mmHg (Normal)</span>
                <span>140 mmHg (Stage 2)</span>
                <span>190 mmHg</span>
              </div>
            </div>

            {/* HbA1c Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Glycated Hemoglobin (HbA1c)</label>
                <span className="font-numeric font-bold text-xs sm:text-sm text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#CBE0D4] dark:border-[#1F2622]">
                  {simulatedInputs.hba1c.toFixed(1)}%
                </span>
              </div>
              <input 
                type="range"
                min="4.0"
                max="12.0"
                step="0.1"
                value={simulatedInputs.hba1c}
                onChange={(e) => handleSliderChange('hba1c', e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788]"
              />
              <div className="flex justify-between text-[10px] text-[#4B5563] dark:text-[#9CA3AF]">
                <span>4.0%</span>
                <span>5.7% (Normal)</span>
                <span>6.5% (Diabetic)</span>
                <span>12.0%</span>
              </div>
            </div>

            {/* Deductible & Plan Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827] dark:text-[#FFFFFF]">Plan Type</label>
                <select
                  value={simulatedInputs.plan_type}
                  onChange={(e) => handleSelectChange('plan_type', e.target.value)}
                  className="w-full text-xs py-2 px-3 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#080B09] text-[#111827] dark:text-[#FFFFFF] focus:ring-1 focus:ring-[#52B788]"
                >
                  <option value="HMO">HMO (Reference)</option>
                  <option value="PPO">PPO</option>
                  <option value="EPO">EPO</option>
                  <option value="POS">POS</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Deductible</label>
                  <span className="font-numeric font-bold text-xs text-[#1B4332] dark:text-[#52B788]">
                    ${simulatedInputs.deductible.toLocaleString()}
                  </span>
                </div>
                <input 
                  type="range"
                  min="500"
                  max="8000"
                  step="250"
                  value={simulatedInputs.deductible}
                  onChange={(e) => handleSliderChange('deductible', e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-[#080B09] rounded-lg appearance-none cursor-pointer accent-[#1B4332] dark:accent-[#52B788] mt-2"
                />
              </div>
            </div>
          </div>

          {/* Modified Parameters Delta Summary Table */}
          {modifiedFields.length > 0 && (
            <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 shadow-card">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#111827] dark:text-[#FFFFFF] mb-1">
                Modified Parameters Breakdown ({modifiedFields.length})
              </h3>
              <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-4">
                Detailed comparison of adjustments made relative to baseline record.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E6EFEA]/40 dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider font-numeric border-b border-[#E5E7EB] dark:border-[#1F2622]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Covariate Parameter</th>
                      <th className="py-2.5 px-4 font-semibold">Baseline Value</th>
                      <th className="py-2.5 px-4 font-semibold">Simulated Value</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2622]">
                    {modifiedFields.map(f => (
                      <tr key={f.key} className="hover:bg-gray-50 dark:hover:bg-[#121714]/50 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-[#111827] dark:text-[#FFFFFF] capitalize">
                          {f.key.replace(/_/g, ' ')}
                        </td>
                        <td className="py-2.5 px-4 text-[#4B5563] dark:text-[#9CA3AF] font-mono">
                          {String(f.original)}
                        </td>
                        <td className="py-2.5 px-4 text-[#1B4332] dark:text-[#52B788] font-bold font-mono">
                          {String(f.simulated)}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788]">
                            Modified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Observational Methodology Notice */}
          <div className="bg-[#FBFBFA] dark:bg-[#080B09]/70 border border-[#E5E7EB] dark:border-[#1F2622] rounded-2xl p-4 text-xs text-[#4B5563] dark:text-[#9CA3AF] flex items-start space-x-3">
            <Info className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Actuarial Model Notice:</b> Simulated cost variations are mathematical linear evaluations computed via Ordinary Least Squares (OLS) closed-form parameters. They demonstrate model sensitivity to specific health and demographic adjustments.
            </p>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: STICKY REAL-TIME SIMULATED COST & DELTA ================= */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
          
          {/* Main Hero Card: Simulated Output & Cost Change (Variance Delta) */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 sm:p-7 shadow-elevated space-y-6 relative overflow-hidden transition-all duration-300">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#23583E]">
                <Activity className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Simulated Output</span>
              </div>

              {isSimulating ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#52B788] font-mono animate-pulse font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#52B788] animate-ping" />
                  Recalculating...
                </span>
              ) : (
                <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                  Live OLS Rate
                </span>
              )}
            </div>

            {/* Primary Simulated Cost Display */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] block mb-1">
                Simulated Annual Expenditure
              </span>
              <div className="font-serif text-4xl sm:text-5xl font-bold text-[#111827] dark:text-[#FFFFFF] tracking-tight flex items-baseline gap-1.5">
                <span className="transition-all duration-300">{animatedSimulatedCost}</span>
                <span className="text-base font-sans font-normal text-[#6B7280] dark:text-[#9CA3AF]">/ yr</span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9CA3AF] pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622]">
                <span>Baseline Reference:</span>
                <span className="font-numeric font-semibold text-[#111827] dark:text-[#FFFFFF]">
                  ${originalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / yr
                </span>
              </div>
            </div>

            {/* Prominent Cost Change / Variance Delta Well */}
            <motion.div 
              layout
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 space-y-2 ${
                deltaDollars < 0 
                  ? 'bg-emerald-50/70 dark:bg-[#0A1F14]/70 border-emerald-200 dark:border-emerald-900/50' 
                  : deltaDollars > 0 
                  ? 'bg-rose-50/70 dark:bg-[#200E0A]/70 border-rose-200 dark:border-rose-900/50' 
                  : 'bg-[#F4F5F0] dark:bg-[#0A0D0B] border-[#E5E7EB] dark:border-[#1F2622]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-[#4B5563] dark:text-[#9CA3AF] flex items-center gap-1.5">
                  {deltaDollars < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : deltaDollars > 0 ? (
                    <TrendingUp className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <Minus className="w-4 h-4 text-gray-500" />
                  )}
                  <span>Net Cost Variance</span>
                </span>

                <span className={`text-xs font-bold font-numeric px-2.5 py-0.5 rounded-full ${
                  deltaDollars < 0 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : deltaDollars > 0 
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                  {deltaPercent >= 0 ? `+${deltaPercent.toFixed(1)}%` : `${deltaPercent.toFixed(1)}%`}
                </span>
              </div>

              {/* Large Delta Number */}
              <div className="flex items-baseline space-x-2">
                <span className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${
                  deltaDollars < 0 
                    ? 'text-emerald-600 dark:text-[#52B788]' 
                    : deltaDollars > 0 
                    ? 'text-rose-600 dark:text-[#E29578]' 
                    : 'text-[#111827] dark:text-[#FFFFFF]'
                }`}>
                  {deltaDollars > 0 ? `+${animatedDeltaDollars}` : deltaDollars < 0 ? `-${animatedDeltaDollars}` : '$0.00'}
                </span>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-sans">
                  {deltaDollars < 0 ? 'projected annual savings' : deltaDollars > 0 ? 'additional expected cost' : 'no variance'}
                </span>
              </div>

              {/* Dynamic Context Explanation */}
              <p className="text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF] pt-1">
                {deltaDollars < 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ Optimization lowers overall actuarial risk exposure.
                  </span>
                ) : deltaDollars > 0 ? (
                  <span className="text-rose-700 dark:text-rose-400 font-medium">
                    ⚠ Higher biometric thresholds or lifestyle factors elevate risk pool.
                  </span>
                ) : (
                  <span>Adjust any slider on the left to inspect instant financial changes.</span>
                )}
              </p>
            </motion.div>

            {/* Quick Modified Tags */}
            <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#111827] dark:text-[#FFFFFF]">Active Changes</span>
                <span className="font-mono text-[11px] text-[#1B4332] dark:text-[#52B788] font-bold">
                  {modifiedFields.length} Modified
                </span>
              </div>

              {modifiedFields.length === 0 ? (
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] italic">
                  Currently matching baseline record.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {modifiedFields.map(f => (
                    <span 
                      key={f.key}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] border border-[#C5DFD3] dark:border-[#23583E]"
                    >
                      {f.key.replace(/_/g, ' ')}: {f.original} → {f.simulated}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Button within Card */}
            {modifiedFields.length > 0 && (
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-[#F4F5F0] dark:bg-[#0A0D0B] text-[#111827] dark:text-[#FFFFFF] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] border border-[#E5E7EB] dark:border-[#1F2622] transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All to Baseline ({modifiedFields.length})</span>
              </button>
            )}

          </div>

          {/* Visual Comparison Chart Card */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#1F2622]">
              <span className="text-xs font-bold text-[#111827] dark:text-[#FFFFFF]">
                Side-by-Side Comparison
              </span>
              <div className="flex items-center space-x-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[#4B5563] dark:text-[#9CA3AF]">
                  <span className="w-2 h-2 rounded-xs bg-[#1B4332]" />
                  Base
                </span>
                <span className="flex items-center gap-1 text-[#4B5563] dark:text-[#9CA3AF]">
                  <span className="w-2 h-2 rounded-xs bg-[#52B788]" />
                  Sim
                </span>
              </div>
            </div>

            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <XAxis 
                    type="number" 
                    tickFormatter={(v) => `$${v.toLocaleString()}`} 
                    stroke="#6B7280"
                    fontSize={10}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#6B7280"
                    fontSize={10}
                    width={60}
                  />
                  <Tooltip 
                    formatter={(val) => [`$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })} / yr`, 'Predicted']}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#E5E7EB', 
                      borderRadius: '10px',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                    }}
                  />
                  <Bar dataKey="cost" radius={[0, 6, 6, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* ================= 3. MOBILE FLOATING STICKY OUTPUT BAR (< lg) ================= */}
      {/* Ensures users on small screens can adjust any slider and immediately see live cost & delta change without scrolling */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0A0D0B]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#1F2622] px-4 py-2.5 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Simulated Cost Output */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-[#6B7280] dark:text-[#9CA3AF]">
                Simulated Cost
              </span>
              {isSimulating && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#52B788] animate-ping" />
              )}
            </div>
            <div className="font-serif text-lg sm:text-xl font-bold text-[#111827] dark:text-[#FFFFFF] leading-tight truncate">
              {animatedSimulatedCost}
              <span className="text-xs font-sans font-normal text-[#6B7280] dark:text-[#9CA3AF]">/yr</span>
            </div>
          </div>

          {/* Cost Change (Delta) Badge */}
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
              deltaDollars < 0 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                : deltaDollars > 0 
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {deltaDollars < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : deltaDollars > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>
                {deltaDollars > 0 ? `+${animatedDeltaDollars}` : deltaDollars < 0 ? `-${animatedDeltaDollars}` : '$0.00'}
              </span>
              <span className="text-[10px] font-mono opacity-80">
                ({deltaPercent >= 0 ? `+${deltaPercent.toFixed(1)}%` : `${deltaPercent.toFixed(1)}%`})
              </span>
            </div>

            {modifiedFields.length > 0 && (
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="p-1.5 rounded-lg text-xs font-medium bg-[#F4F5F0] dark:bg-[#121714] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] border border-[#E5E7EB] dark:border-[#1F2622]"
                title="Reset Changes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. LOAD FROM HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] rounded-3xl p-6 w-full max-w-2xl shadow-elevated max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#111827] dark:text-[#FFFFFF]">
                    Select Saved Record as Baseline
                  </h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                    Choose any past prediction from SQLite audit history to use as the starting profile.
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-grow divide-y divide-[#E5E7EB] dark:divide-[#1F2622] my-4">
                {historyRecords.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
                    No past records found in SQLite history.
                  </div>
                ) : (
                  historyRecords.map(rec => {
                    const params = rec.input_parameters || {};
                    return (
                      <div
                        key={rec.id}
                        onClick={() => handleSelectHistoryRecord(rec)}
                        className="py-3 px-3 hover:bg-[#F4F5F0] dark:hover:bg-[#121714] rounded-xl cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-[#1B4332] dark:text-[#52B788]">
                              #{rec.id}
                            </span>
                            <span className="text-xs font-bold text-[#111827] dark:text-[#FFFFFF]">
                              Age {params.age}, {params.sex}, {params.smoker} Smoker
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">
                            BMI {params.bmi} • {params.chronic_count ?? 0} Chronic • Model: {rec.model_type?.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-numeric font-bold text-sm text-[#111827] dark:text-[#FFFFFF]">
                            ${rec.predicted_cost?.toLocaleString()}
                          </span>
                          <span className="text-[10px] block text-[#4B5563] dark:text-[#9CA3AF]">
                            Select Baseline →
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#1F2622] text-right">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
