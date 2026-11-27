import React, { useState, useRef, useEffect } from 'react';
import ModelSelector from './ModelSelector';
import PredictionForm from './PredictionForm';
import PredictionResult from './PredictionResult';
import { predictCharges } from '../../services/api';
import { Calculator, AlertCircle } from 'lucide-react';

export default function EstimatorView({ intakeData }) {
  const [selectedModel, setSelectedModel] = useState('model_b');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [serverError, setServerError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  
  const resultRef = useRef(null);

  // Initial Form State
  const [formData, setFormData] = useState({
    model_type: 'model_b',
    age: 38,
    sex: 'Female',
    bmi: 27.5,
    dependents: 1,
    smoker: 'Never',
    region: 'Central',
    // Model B specific defaults
    income: 58000,
    systolic_bp: 122,
    hba1c: 5.4,
    visits_last_year: 2,
    hospitalizations_last_3yrs: 0,
    chronic_count: 0,
    deductible: 1000,
    plan_type: 'HMO',
  });

  // Synchronize intake data when provided from the interactive login/intake questionnaire
  useEffect(() => {
    if (intakeData) {
      setFormData(prev => ({
        ...prev,
        ...intakeData,
        model_type: 'model_b'
      }));
      setSelectedModel('model_b');
    }
  }, [intakeData]);

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    setFormData((prev) => ({
      ...prev,
      model_type: modelId,
    }));
    setValidationErrors([]);
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationErrors([]);
    setServerError(null);

    try {
      const payload = {
        ...formData,
        model_type: selectedModel,
      };

      // If Model A is selected, send only the 6 core demographic parameters
      if (selectedModel === 'model_a') {
        delete payload.income;
        delete payload.systolic_bp;
        delete payload.hba1c;
        delete payload.visits_last_year;
        delete payload.hospitalizations_last_3yrs;
        delete payload.chronic_count;
        delete payload.deductible;
        delete payload.plan_type;
      }

      const response = await predictCharges(payload);
      setPredictionResult(response);

      // Smooth scroll to result
      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (err) {
      if (err.response && err.response.data) {
        if (err.response.data.details) {
          setValidationErrors(err.response.data.details);
        } else if (err.response.data.message) {
          setServerError(err.response.data.message);
        } else {
          setServerError('The backend rejected the request with status ' + err.response.status);
        }
      } else if (err.request) {
        setServerError('Cannot connect to the Flask API at http://localhost:5000. Please ensure the backend server is running.');
      } else {
        setServerError(err.message || 'An unexpected error occurred during prediction.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-[#FBFBFA] dark:bg-[#000000] min-h-screen transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Header */}
        <div className="space-y-3 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E6EFEA] dark:bg-[#080B09] border border-[#CBE0D4] dark:border-[#1F2622]">
            <Calculator className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788]" />
            <span className="text-xs font-semibold text-[#1B4332] dark:text-[#52B788] font-numeric uppercase tracking-wider">
              Interactive Actuarial Calculator
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#111827] dark:text-[#FFFFFF] tracking-tight">
            Estimate Annual Healthcare Costs
          </h1>
          <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#9CA3AF] max-w-3xl leading-relaxed">
            Select between the demographic baseline (<strong className="text-[#111827] dark:text-[#FFFFFF]">Model A</strong>) or comprehensive clinical intake (<strong className="text-[#111827] dark:text-[#FFFFFF]">Model B</strong>). 
            Review the exact linear factor decomposition and how individual metrics adjust baseline charges.
          </p>
        </div>

        {/* General Server Error Alert */}
        {serverError && (
          <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-rose-800 dark:text-rose-300">API Communication Error</h4>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">{serverError}</p>
            </div>
          </div>
        )}

        {/* 1. Model Selector */}
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={handleModelChange}
        />

        {/* Image 3 Inspired Interactive Stepper */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#E6EFEA] dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] flex items-center justify-center font-bold text-sm shadow-xs">
              ✓
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-semibold block">Actuarial Cost Estimator</span>
              <span className="text-sm font-bold text-[#111827] dark:text-[#FFFFFF]">Closed-Form Parametric Workflow</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] border border-[#C5DFD3] dark:border-[#1F2622] shadow-xs whitespace-nowrap">
              <span className="w-4 h-4 rounded-full bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] flex items-center justify-center text-[10px]">1</span>
              <span>Model Selection</span>
            </div>
            <span className="text-[#1B4332]/40 dark:text-[#52B788]/40 font-bold">→</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border whitespace-nowrap ${
              predictionResult 
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] border-[#C5DFD3] dark:border-[#1F2622] shadow-xs' 
                : 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] border-[#1B4332] dark:border-[#52B788] ring-2 ring-[#1B4332]/10 dark:ring-[#52B788]/20 shadow-xs'
            }`}>
              <span className="w-4 h-4 rounded-full bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] flex items-center justify-center text-[10px]">2</span>
              <span>Patient Parameters</span>
            </div>
            <span className="text-[#1B4332]/40 dark:text-[#52B788]/40 font-bold">→</span>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border whitespace-nowrap ${
              predictionResult 
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] border-[#1B4332] dark:border-[#52B788] ring-2 ring-[#1B4332]/10 dark:ring-[#52B788]/20 shadow-xs' 
                : 'bg-white/60 dark:bg-[#0F1412]/60 text-[#4B5563] dark:text-[#9CA3AF] border-transparent'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                predictionResult ? 'bg-[#52B788] text-white dark:text-[#000000] font-bold' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>3</span>
              <span>Inferred Cost</span>
            </div>
          </div>
        </div>

        {/* 2. Interactive Form */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
              Step 2 • Patient Parameter Specification
            </span>
            <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">
              Live Flask REST Validation
            </span>
          </div>
          
          <PredictionForm
            selectedModel={selectedModel}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            validationErrors={validationErrors}
          />
        </div>

        {/* 3. Prediction Result Section */}
        <div ref={resultRef}>
          {predictionResult && (
            <div className="space-y-4 pt-8">
              <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
                Step 3 • OLS Mathematical Decomposition & Results
              </span>
              <PredictionResult result={predictionResult} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
