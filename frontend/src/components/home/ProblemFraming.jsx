import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, ShieldCheck, GitCompare, Database, CheckCircle2, 
  ArrowRight, Activity, Cpu, Sparkles, BookOpen, Layers, 
  BarChart2, FileSpreadsheet, AlertTriangle, HelpCircle, Calculator 
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ProblemFraming({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('model_b');
  const sectionRef = useRef(null);
  const equationCardRef = useRef(null);
  const pipelineRef = useRef(null);

  useEffect(() => {
    // Only run GSAP if user does not prefer reduced motion
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (equationCardRef.current) {
        gsap.from(equationCardRef.current, {
          scrollTrigger: {
            trigger: equationCardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 35,
          duration: 0.8,
          ease: 'power2.out',
        });
      }

      if (pipelineRef.current) {
        gsap.from(pipelineRef.current.children, {
          scrollTrigger: {
            trigger: pipelineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 30,
          stagger: 0.15,
          duration: 0.7,
          ease: 'power2.out',
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="space-y-24 py-16 md:py-24 bg-[#FBFBFA] dark:bg-[#000000] transition-colors duration-200">
      
      {/* 1. Problem Introduction: Why Linear Regression over Black-Box ML */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center space-x-2 text-[#1B4332] dark:text-[#52B788] text-xs font-numeric font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#52B788]" />
              <span>Actuarial Fiduciary Standard</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#111827] dark:text-[#FFFFFF] leading-tight tracking-tight">
              Why Opaque Black-Box Models Fail in Healthcare Underwriting.
            </h2>
            
            <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed font-sans">
              Deep neural networks and boosted decision forests create high-variance predictions that cannot be explained in a court of law or regulatory rate-filing. 
              When a policyholder’s premium rises by $1,200, actuaries must provide exact causal feature contributions.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start space-x-3 text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF]">
                <CheckCircle2 className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#111827] dark:text-[#FFFFFF]">Mathematical Traceability:</strong> Every coefficient represents a ceteris paribus dollar rate change per unit change in input.
                </span>
              </div>
              <div className="flex items-start space-x-3 text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF]">
                <CheckCircle2 className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#111827] dark:text-[#FFFFFF]">Zero Data Snooping:</strong> Exactly 10 post-policy claim variables were excluded to preserve pre-policy intake validity.
                </span>
              </div>
              <div className="flex items-start space-x-3 text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF]">
                <CheckCircle2 className="w-5 h-5 text-[#52B788] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#111827] dark:text-[#FFFFFF]">Strict Orthogonality:</strong> All regressors maintain VIF &lt; 2.5, avoiding the singularity traps common in multi-variable health data.
                </span>
              </div>
            </div>
          </div>

          <div ref={equationCardRef} className="lg:col-span-6">
            <div className="bg-[#E6EFEA]/50 dark:bg-[#080B09] rounded-3xl p-8 border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] dark:border-[#1F2622]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1B4332] dark:bg-[#52B788] text-[#E6EFEA] dark:text-[#000000] flex items-center justify-center font-serif text-sm font-bold">
                    OLS
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#111827] dark:text-[#FFFFFF]">
                    The Ordinary Least Squares Equation
                  </h3>
                </div>
                <span className="font-numeric text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#1B4332] dark:text-[#52B788]">
                  Exact Global Optimum
                </span>
              </div>

              <div className="bg-[#112D22] text-white p-5 sm:p-6 rounded-2xl font-mono text-sm space-y-2.5 border border-[#1B4332] dark:border-[#1F2622] shadow-inner">
                <p className="text-[#52B788] text-xs">// Closed-Form Normal Equation</p>
                <p className="text-xl sm:text-2xl font-bold text-white tracking-wide">β̂ = (XᵀX)⁻¹ Xᵀy</p>
                <div className="pt-2 border-t border-[#1B4332] text-xs text-[#E6EFEA]/80 leading-relaxed font-sans">
                  Where <span className="font-mono text-[#52B788]">X</span> is the 80,000 × 21 design matrix, 
                  <span className="font-mono text-[#52B788]"> y</span> is holdout expenditure, and 
                  <span className="font-mono text-[#52B788]">β̂</span> is the parameter vector uniquely minimizing the residual sum of squares.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-white dark:bg-[#0F1412] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[11px] font-numeric text-[#4B5563] dark:text-[#9CA3AF] uppercase block">Train Loss Objective</span>
                  <span className="font-mono font-bold text-[#111827] dark:text-[#FFFFFF] text-sm">S(β) = Σ(yᵢ - xᵢᵀβ)²</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-[#0F1412] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[11px] font-numeric text-[#4B5563] dark:text-[#9CA3AF] uppercase block">Hyperparameters</span>
                  <span className="font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm">0 (Pure Analytic)</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 2. How the Prediction System Works: 3-Step Linear Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider">
            Inference Pipeline Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF] tracking-tight">
            How the MedCost.ai System Predicts Charges
          </h2>
          <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
            From patient intake and deterministic one-hot encoding to closed-form matrix multiplication and SQLite persistence.
          </p>
        </div>

        <div ref={pipelineRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card hover:shadow-elevated transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center font-numeric text-lg font-bold border border-[#CBE0D4] dark:border-[#1F2622]">
                01
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">
                Intake Validation & Reference Mapping
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed font-sans">
                Patient metrics pass through strict Flask validation. Categorical variables are mapped to one-hot design columns, dropping baseline levels (Female, Never, Central, HMO) to prevent collinearity traps.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] font-mono text-xs text-[#1B4332] dark:text-[#52B788] font-semibold">
              Dropped Baselines = $0.00
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card hover:shadow-elevated transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center font-numeric text-lg font-bold border border-[#CBE0D4] dark:border-[#1F2622]">
                02
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">
                Closed-Form Dot Product Inference
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed font-sans">
                The fitted serialized Scikit-learn pipeline executes instantaneous dot-product prediction: 
                <span className="font-mono text-[#1B4332] dark:text-[#52B788] font-semibold"> ŷ = β₀ + Σ(βⱼ · xⱼ)</span>. Intercept and every regressor product are captured with 64-bit precision.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] font-mono text-xs text-[#1B4332] dark:text-[#52B788] font-semibold">
              Tolerance Discrepancy &le; 10⁻⁶
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card hover:shadow-elevated transition-shadow space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center font-numeric text-lg font-bold border border-[#CBE0D4] dark:border-[#1F2622]">
                03
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">
                Decomposition & Audit Logging
              </h3>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed font-sans">
                Calculated predictions and full unrounded factor contributions are rendered in the interactive UI and permanently archived to the SQLite <span className="font-mono text-[#111827] dark:text-[#FFFFFF]">prediction_history</span> table for RFC 4180 CSV export.
              </p>
            </div>
            <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] font-mono text-xs text-[#1B4332] dark:text-[#52B788] font-semibold">
              SQLite Immutable Audit Trail
            </div>
          </div>

        </div>
      </section>

      {/* 3. Model Comparison: Model A vs Model B Side-by-Side */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E6EFEA]/40 dark:bg-[#080B09] rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] dark:border-[#1F2622] space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E5E7EB] dark:border-[#1F2622]">
            <div>
              <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider">
                Comparative Actuarial Architectures
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF] mt-2">
                Model A (Core 6) vs. Model B (Clinical 14)
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] max-w-xl mt-1">
                Both models evaluated on an identical 80,000-train / 20,000-test holdout split (Random Seed 42).
              </p>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] self-start md:self-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('model_a')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'model_a' 
                    ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold' 
                    : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                }`}
              >
                Model A (Baseline)
              </button>
              <button
                onClick={() => setActiveTab('model_b')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'model_b' 
                    ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold' 
                    : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
                }`}
              >
                Model B (Recommended)
              </button>
            </div>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Model A Card */}
            <div className={`p-8 rounded-3xl border transition-all ${
              activeTab === 'model_a' 
                ? 'bg-white dark:bg-[#0F1412] border-[#1B4332] dark:border-[#52B788] shadow-elevated' 
                : 'bg-white/70 dark:bg-[#0F1412]/70 border-[#E5E7EB] dark:border-[#1F2622]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                  Baseline Demographic Tier
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-numeric font-bold bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
                  6 Regressors
                </span>
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-3">
                Model A — Demographic & Lifestyle
              </h3>
              
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] mt-2 leading-relaxed">
                Inputs: Age, Sex, BMI, Dependents, Smoker, Region. Serves as the minimal actuarial baseline.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3.5 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[11px] font-numeric text-[#4B5563] dark:text-[#9CA3AF] uppercase block">Holdout Test R²</span>
                  <span className="font-numeric text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">4.54%</span>
                </div>
                <div className="p-3.5 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[11px] font-numeric text-[#4B5563] dark:text-[#9CA3AF] uppercase block">Holdout Test MAE</span>
                  <span className="font-numeric text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">$1,934.10</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] text-xs text-[#4B5563] dark:text-[#9CA3AF] space-y-1">
                <div>Fitted Intercept (β₀): <strong className="font-mono text-[#111827] dark:text-[#FFFFFF]">$652.65</strong></div>
                <div>Test RMSE: <strong className="font-mono text-[#111827] dark:text-[#FFFFFF]">$3,064.79</strong></div>
              </div>
            </div>

            {/* Model B Card */}
            <div className={`p-8 rounded-3xl border transition-all ${
              activeTab === 'model_b' 
                ? 'bg-white dark:bg-[#0F1412] border-[#1B4332] dark:border-[#52B788] shadow-elevated' 
                : 'bg-white/70 dark:bg-[#0F1412]/70 border-[#E5E7EB] dark:border-[#1F2622]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#1B4332] dark:text-[#52B788]">
                  Comprehensive Clinical Tier
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-numeric font-bold bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000]">
                  14 Regressors (+271.8% R²)
                </span>
              </div>
              
              <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-3">
                Model B — Clinical & Policy Profile
              </h3>
              
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] mt-2 leading-relaxed">
                Inputs: Core 6 plus Income, Systolic BP, HbA1c, Doctor Visits, Hospitalizations (3y), Chronic Conditions, Deductible, Plan Type.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3.5 bg-[#E6EFEA] dark:bg-[#080B09] rounded-xl border border-[#CBE0D4] dark:border-[#1F2622]">
                  <span className="text-[11px] font-numeric text-[#1B4332] dark:text-[#52B788] uppercase block font-semibold">Holdout Test R²</span>
                  <span className="font-numeric text-2xl font-bold text-[#1B4332] dark:text-[#52B788]">16.90%</span>
                  <span className="text-[10px] text-[#2D6A4F] dark:text-[#95D5B2] block mt-0.5 font-medium">+12.35% abs lift</span>
                </div>
                <div className="p-3.5 bg-[#E6EFEA] dark:bg-[#080B09] rounded-xl border border-[#CBE0D4] dark:border-[#1F2622]">
                  <span className="text-[11px] font-numeric text-[#1B4332] dark:text-[#52B788] uppercase block font-semibold">Holdout Test MAE</span>
                  <span className="font-numeric text-2xl font-bold text-[#1B4332] dark:text-[#52B788]">$1,778.62</span>
                  <span className="text-[10px] text-[#2D6A4F] dark:text-[#95D5B2] block mt-0.5 font-medium">-$155.48 error drop</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] text-xs text-[#4B5563] dark:text-[#9CA3AF] space-y-1">
                <div>Fitted Intercept (β₀): <strong className="font-mono text-[#1B4332] dark:text-[#52B788]">$48.23</strong></div>
                <div>Top Positive Weight: <strong className="font-mono text-[#1B4332] dark:text-[#52B788]">Hospitalizations (+$1,928.25)</strong></div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Dataset Overview & Leakage Prevention Audit */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider">
              Data Integrity & Leakage Prevention
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF]">
              10 Post-Policy Variables Systematically Excluded.
            </h2>
            <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed font-sans">
              Many academic papers mistakenly inflate R² by incorporating post-incident target-derived features. 
              Our rigorous data audit identified and expunged 10 variables that would invalidate real-world prediction at policy inception.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              {[
                'annual_premium', 'monthly_premium', 'claims_count',
                'avg_claim_amount', 'total_claims_paid', 'risk_score',
                'is_high_risk', 'had_major_procedure', 'proc_*_counts'
              ].map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-white dark:bg-[#080B09] border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 flex items-center space-x-2 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="truncate font-medium">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-[#0F1412] rounded-3xl p-8 border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#111827] dark:text-[#FFFFFF]">
              Fixed Reference Baselines (β = $0.00)
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
              To guarantee full-rank design matrices without singular inversions, one category is omitted per discrete group:
            </p>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] flex justify-between items-center">
                <span className="text-[#4B5563] dark:text-[#9CA3AF] font-sans">Sex Baseline</span>
                <span className="font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#000000] px-2 py-0.5 rounded border border-transparent dark:border-[#1F2622]">Female</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] flex justify-between items-center">
                <span className="text-[#4B5563] dark:text-[#9CA3AF] font-sans">Smoking Baseline</span>
                <span className="font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#000000] px-2 py-0.5 rounded border border-transparent dark:border-[#1F2622]">Never</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] flex justify-between items-center">
                <span className="text-[#4B5563] dark:text-[#9CA3AF] font-sans">Region Baseline</span>
                <span className="font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#000000] px-2 py-0.5 rounded border border-transparent dark:border-[#1F2622]">Central</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] flex justify-between items-center">
                <span className="text-[#4B5563] dark:text-[#9CA3AF] font-sans">Plan Baseline</span>
                <span className="font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#000000] px-2 py-0.5 rounded border border-transparent dark:border-[#1F2622]">HMO</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Final Call-to-Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-[#112D22] text-white shadow-elevated relative overflow-hidden border border-[#1B4332]">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#52B788]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative max-w-2xl space-y-6">
            <span className="px-3 py-1 rounded-full text-xs font-numeric font-semibold bg-[#1B4332] text-[#E6EFEA] border border-[#52B788]/30 uppercase tracking-wider">
              Interactive Academic System
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
              Test Instant Predictions or Review 8 Empirical Diagnostics.
            </h2>
            <p className="text-base sm:text-lg text-[#E6EFEA] font-light leading-relaxed">
              Explore patient scenarios in the Cost Estimator or analyze the full econometric diagnostics suite including heteroscedasticity fan charts and VIF collinearity.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('estimator')}
                className="px-7 py-3.5 rounded-xl bg-[#52B788] hover:bg-[#439c73] text-[#112D22] font-semibold text-sm transition-all shadow-card flex items-center space-x-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Launch Cost Estimator</span>
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className="px-6 py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#153628] text-white border border-[#52B788]/30 font-medium text-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-[#52B788]" />
                <span>Open Analytics Suite</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
