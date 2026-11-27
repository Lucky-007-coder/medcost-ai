import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Activity, ArrowRight, ShieldCheck, Database, 
  Cpu, FileDown, CheckCircle2, Award, Terminal, Code2, 
  ExternalLink, Layers, GraduationCap, Sparkles, SlidersHorizontal, Calculator 
} from 'lucide-react';
import { getMetrics } from '../../services/api';
import CoefficientChart from '../analytics/CoefficientChart';
import MethodologySection from '../analytics/MethodologySection';

export default function AboutUsView({ onNavigate }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMetrics()
      .then((data) => {
        setMetrics(data);
      })
      .catch((err) => {
        console.error('Failed to load metrics for About page:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const workflowSteps = [
    {
      step: '01',
      title: 'Clinical & Demographic Intake',
      description: 'Intakes 11 verified pre-policy covariates including age, BMI, systolic blood pressure, HbA1c glucose levels, and chronic disease counts.',
      badge: 'Pre-Policy Data'
    },
    {
      step: '02',
      title: 'Categorical Matrix Encoding',
      description: 'Encodes nominal categories (sex, smoker status, region, insurance plan) using k-1 reference baselines to prevent multicollinearity and dummy variable trap.',
      badge: 'Zero Target Leakage'
    },
    {
      step: '03',
      title: 'OLS Normal Equation Solver',
      description: 'Evaluates the exact closed-form global optimum β̂ = (XᵀX)⁻¹ Xᵀy trained deterministically on 80,000 policyholder records without black-box approximations.',
      badge: 'Global Analytic Optimum'
    },
    {
      step: '04',
      title: 'Closed-Form Decomposition',
      description: 'Decomposes the predicted annual expense into exact regressor dollar attributions ŷ = β₀ + Σ(βⱼ · xⱼ) verified to machine precision (≤ 10⁻⁶).',
      badge: '100% Explainability'
    },
    {
      step: '05',
      title: 'Audit Ledger & PDF Certification',
      description: 'Records predictions immutably to a local ACID SQLite database and compiles certified two-pass actuarial reports via ReportLab.',
      badge: 'ACID Relational Storage'
    }
  ];

  const techStack = [
    {
      layer: 'Frontend Client',
      tech: 'React 19 • Vite • Tailwind v4 • Framer Motion • Recharts',
      description: 'Responsive editorial healthcare interface with OLED pitch-black styling and fluid debounced state transitions.'
    },
    {
      layer: 'API Microservice',
      tech: 'Python Flask REST API • Werkzeug Server',
      description: 'Stateless JSON endpoints for inference, real-time What-If simulations, metrics serialization, and health beacons.'
    },
    {
      layer: 'Analytical Engine',
      tech: 'Scikit-Learn • NumPy • SciPy OLS Regression',
      description: 'Dual ordinary least squares linear engines with verifiable coefficient matrices and residual diagnostics.'
    },
    {
      layer: 'Persistence & Reports',
      tech: 'SQLite Database • ReportLab Engine v4',
      description: 'Relational immutable audit trail and vector-accurate clinical PDF generation with dynamic page numbering.'
    }
  ];

  return (
    <div className="py-12 md:py-20 bg-[#FBFBFA] dark:bg-[#000000] min-h-screen text-[#111827] dark:text-[#FFFFFF] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Banner */}
        <div className="space-y-4 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
            <BookOpen className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Academic Platform Documentation & Team</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#111827] dark:text-[#FFFFFF]">
            About <span className="text-[#1B4332] dark:text-[#52B788] italic">MedCost.ai</span>
          </h1>

          <p className="text-base sm:text-lg text-[#4B5563] dark:text-[#9CA3AF] max-w-3xl leading-relaxed">
            MedCost.ai is a transparent, strictly interpretable healthcare economics platform built on closed-form Ordinary Least Squares regression to demystify annual policyholder expenditures without black-box opacity.
          </p>
        </div>

        {/* Research & Engineering Team */}
        <section className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              <GraduationCap className="w-3.5 h-3.5 text-[#52B788]" />
              <span>Project Collaborators</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF]">
              Research & Development Team
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] max-w-3xl leading-relaxed">
              MedCost.ai was conceptualized, researched, and engineered by a collaborative undergraduate research team dedicated to advancing algorithmic transparency and closed-form econometric interpretability in health insurance pricing.
            </p>
          </div>

          {/* 5-Member Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: 'Lucky Gupta',
                initials: 'LG',
                role: 'Project Lead & Predictive Modeling',
                academic: 'BTech Undergraduate (2nd Year)',
                focus: 'Mathematical formulation of OLS normal equations, zero-leakage feature selection, and closed-form linear decomposition engine.',
                color: 'from-[#1B4332] to-[#2D6A4F]',
                badge: 'Lead Investigator'
              },
              {
                name: 'Ahsan Afaque',
                initials: 'AA',
                role: 'Healthcare Informatics & Systems Architecture',
                academic: 'BTech Undergraduate',
                focus: 'High-throughput Flask REST API architecture, transactional SQLite audit logging, and PDF certification pipelines.',
                color: 'from-[#133324] to-[#1B4332]',
                badge: 'Systems Architecture'
              },
              {
                name: 'Koushik Badayakar',
                initials: 'KB',
                role: 'Statistical Analysis & Model Benchmarking',
                academic: 'BTech Undergraduate',
                focus: '5-fold cross-validation audits, Cook\'s distance residual diagnostics, and multicollinearity (VIF) verification across 100k records.',
                color: 'from-[#1E3A2F] to-[#2D5A46]',
                badge: 'Statistical Auditing'
              },
              {
                name: 'Kazi Samiul',
                initials: 'KS',
                role: 'Frontend UI/UX & Interaction Engineering',
                academic: 'BTech Undergraduate',
                focus: 'Typeform-inspired one-question-per-step clinical intake flow, dark-mode design system, and responsive Recharts visualizations.',
                color: 'from-[#16382C] to-[#27533E]',
                badge: 'Interactive UI/UX'
              },
              {
                name: 'Koustav Ghosh',
                initials: 'KG',
                role: 'Econometric Validation & Actuarial Research',
                academic: 'BTech Undergraduate',
                focus: 'Actuarial risk tiering standards, smoking multiplier verification, and pre-policy clinical covariate audit compliance.',
                color: 'from-[#1C4533] to-[#2E6B4F]',
                badge: 'Actuarial Economics'
              }
            ].map((member) => (
              <div 
                key={member.name}
                className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 shadow-card hover:border-[#52B788]/60 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    {/* Clean Monogram Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#1B4332] to-[#2D6A4F] text-[#52B788] ring-2 ring-[#52B788]/60 flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:ring-[#52B788] transition-all">
                      {member.initials}
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#E6EFEA] dark:bg-[#133324] text-[#1B4332] dark:text-[#52B788] border border-[#C5DFD3] dark:border-[#23583E] font-medium">
                      {member.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#111827] dark:text-[#FFFFFF] group-hover:text-[#1B4332] dark:group-hover:text-[#52B788] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#1B4332] dark:text-[#52B788] mt-0.5">
                      {member.role}
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] font-mono mt-0.5">
                      {member.academic}
                    </p>
                  </div>

                  <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed pt-1">
                    {member.focus}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#52B788]" />
                    <span>Verified Contributor</span>
                  </span>
                  <span className="font-mono text-[10px] text-[#52B788]">MedCost.ai</span>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Mission Statement */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 sm:p-8 shadow-card space-y-4">
            <blockquote className="text-sm sm:text-base text-[#4B5563] dark:text-[#F1F5F2]/90 leading-relaxed italic border-l-2 border-[#52B788] pl-4 text-left">
              "In clinical finance and insurance underwriting, opaque black-box machine learning models create unexplainable liabilities. Our collaborative undergraduate research team engineered MedCost.ai to demonstrate that closed-form Ordinary Least Squares regression, coupled with strict pre-policy clinical covariates, provides the mathematical determinism and audited accountability that modern healthcare policy demands."
            </blockquote>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622]">
                <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase font-mono block">Dataset</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">100k Records</span>
              </div>
              <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622]">
                <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase font-mono block">Clinical R²</span>
                <span className="font-numeric text-base font-bold text-[#52B788]">16.90%</span>
              </div>
              <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622]">
                <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase font-mono block">Decomposition</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">≤ 10⁻⁶ Tol</span>
              </div>
              <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622]">
                <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase font-mono block">Target Leakage</span>
                <span className="font-numeric text-base font-bold text-[#52B788]">0% Post-Claim</span>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Diagram & How It Works */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">
              Architectural Pipeline
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF]">
              How MedCost.ai Operates
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] max-w-3xl">
              From raw patient intake to serialized linear decomposition and certified PDF generation, every operation maintains continuous audit traceability.
            </p>
          </div>

          {/* Workflow Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => (
              <div 
                key={step.step}
                className="bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card flex flex-col justify-between space-y-3 relative group hover:border-[#52B788]/60 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-numeric text-xl font-bold text-[#1B4332] dark:text-[#52B788]">
                      {step.step}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#E6EFEA] dark:bg-[#0A0D0B] text-[#1B4332] dark:text-[#52B788] border border-[#C5DFD3] dark:border-[#1F2622]">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#111827] dark:text-[#FFFFFF]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#52B788]/40">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Technical Architecture Stack */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-bold">
              Engineering Stack
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF]">
              Full-Stack System Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {techStack.map((item) => (
              <div 
                key={item.layer}
                className="bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-2.5"
              >
                <div className="flex items-center space-x-2 text-[#1B4332] dark:text-[#52B788]">
                  <Cpu className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase font-mono tracking-wider">{item.layer}</span>
                </div>
                <h4 className="font-semibold text-xs text-[#111827] dark:text-[#FFFFFF]">
                  {item.tech}
                </h4>
                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics Section Part 1: Regression Coefficients (β) & Feature Weights */}
        <section id="coefficients-section" className="space-y-4 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622]">
          <div className="space-y-1 pb-2">
            <div className="inline-flex items-center gap-2 text-[#1B4332] dark:text-[#52B788] text-xs font-mono font-medium tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#52B788]"></span>
              <span>Empirical Weights Analysis</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#111827] dark:text-[#FFFFFF]">
              Regression Coefficients (β) & Feature Weights
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF]">
              Direct dollar marginal contributions for both baseline demographic OLS and expanded clinical intake regression models.
            </p>
          </div>

          {loading && !metrics ? (
            <div className="h-96 rounded-3xl bg-[#F4F5F0] dark:bg-[#0A0D0B] animate-pulse border border-[#E5E7EB] dark:border-[#1F2622]" />
          ) : (
            <CoefficientChart metadata={metrics} />
          )}
        </section>

        {/* Analytics Section Part 2: Academic Methodology, Closed-Form Derivation, and Gauss-Markov Audit */}
        <section id="methodology-section" className="space-y-4">
          <MethodologySection />
        </section>

        {/* Action Navigation Callout */}
        <section className="bg-gradient-to-br from-[#1B4332] to-[#0E241B] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-[#2D6A4F]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
              Ready to Explore Predictions?
            </h3>
            <p className="text-sm text-[#E6EFEA]/80 max-w-xl">
              Calculate personalized healthcare costs with live mathematical decomposition or simulate counterfactual What-If scenarios.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate('estimator')}
              className="px-5 py-3 rounded-xl bg-[#52B788] text-[#111A16] font-bold text-xs sm:text-sm hover:bg-[#40916C] transition-all flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Cost Estimator</span>
            </button>
            <button
              onClick={() => onNavigate('simulator')}
              className="px-5 py-3 rounded-xl bg-[#19251F] text-[#F1F5F2] hover:bg-[#202F27] border border-[#34443A] font-medium text-xs sm:text-sm transition-all flex items-center space-x-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>What-If Simulator</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
