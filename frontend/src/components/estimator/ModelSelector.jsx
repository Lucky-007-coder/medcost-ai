import React from 'react';
import { motion } from 'framer-motion';
import { Users, Stethoscope, CheckCircle2 } from 'lucide-react';

export default function ModelSelector({ selectedModel, onSelectModel }) {
  const models = [
    {
      id: 'model_a',
      title: 'Model A — Basic Prediction',
      subtitle: 'Demographic & Lifestyle Architecture',
      description: 'Foundational actuarial baseline using strictly non-clinical demographics. Evaluates how age, sex, body mass index, dependents, smoking, and geographic region estimate baseline charges.',
      metrics: 'R² = 4.54% • MAE: $1,934',
      featuresCount: '6 Input Parameters',
      pipeline: 'linear_regression_model_a.joblib',
      icon: Users,
      badge: 'Core Baseline'
    },
    {
      id: 'model_b',
      title: 'Model B — Clinical Prediction',
      subtitle: 'Comprehensive Health & Policy Profile',
      description: 'Extended healthcare model incorporating pre-policy biometrics, outpatient visits, 3-year hospitalization history, chronic conditions, and policy deductible choices (leakage-free).',
      metrics: 'R² = 16.90% • MAE: $1,778',
      featuresCount: '14 Input Parameters',
      pipeline: 'linear_regression_model_b.joblib',
      icon: Stethoscope,
      badge: 'Recommended for Viva (+271.8% Lift)'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
            Step 1 • Model Selection
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-0.5">
            Select Actuarial Model Tier
          </h2>
        </div>
        <span className="hidden sm:inline-block font-mono text-xs text-[#4B5563] dark:text-[#9CA3AF]">
          Active OLS Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {models.map((m) => {
          const isSelected = selectedModel === m.id;
          const Icon = m.icon;

          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectModel(m.id)}
              className={`relative p-6 sm:p-7 rounded-3xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-[#0F1412] border-[#1B4332] dark:border-[#52B788] shadow-elevated ring-2 ring-[#1B4332]/20 dark:ring-[#52B788]/20'
                  : 'bg-white/90 dark:bg-[#080B09]/90 border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#1B4332]/40 dark:hover:border-[#52B788]/40 hover:bg-white dark:hover:bg-[#161D19] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-sm'
                        : 'bg-[#E6EFEA] dark:bg-[#000000] text-[#1B4332] dark:text-[#52B788]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`text-[11px] font-numeric font-bold px-2.5 py-0.5 rounded-full border ${
                      isSelected 
                        ? 'bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border-[#CBE0D4] dark:border-[#1F2622]' 
                        : 'bg-[#FBFBFA] dark:bg-[#000000] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622]'
                    }`}>
                      {m.badge}
                    </span>
                    <h3 className="text-lg font-bold text-[#111827] dark:text-[#FFFFFF] mt-1 font-sans">
                      {m.title}
                    </h3>
                  </div>
                </div>

                <div className="flex-shrink-0 pt-1">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#1B4332] dark:border-[#52B788] bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000]'
                        : 'border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#080B09]'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed font-sans">
                {m.description}
              </p>

              <div className="mt-5 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between text-xs sm:text-sm">
                <span className="font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm sm:text-base">{m.metrics}</span>
                <span className="font-mono text-[#4B5563] dark:text-[#9CA3AF] text-xs">{m.featuresCount}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
