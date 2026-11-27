import React from 'react';
import { Calculator, BarChart3, History, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function TabPlaceholder({ tabId, onReturnToOverview }) {
  const tabConfigs = {
    estimator: {
      phase: 'Phase 4 Preview',
      title: 'Cost Estimator Interface',
      desc: 'This module will provide an interactive patient intake form with real-time field validation, animated Framer Motion financial counter, and live Linear Regression factor contribution decomposition.',
      features: [
        'Mode Toggle: Model A (Basic 6 Demographics) vs Model B (Full Clinical Profile)',
        'Real-time sliders for Age, BMI, Blood Pressure, and HbA1c',
        'Reference-category aware contribution breakdown card showing delta contributions relative to baseline',
        'Instant communication with POST /api/predict and SQLite audit logging'
      ],
      icon: Calculator
    },
    analytics: {
      phase: 'Phase 5 Preview',
      title: 'Model Evaluation & Academic Diagnostics',
      desc: 'This module will render empirical Recharts visualizations powered by dataset_summary.json and model_metadata.json generated in Phase 1.',
      features: [
        'Actual vs. Predicted test set scatter plot with ideal y = x benchmark',
        'Residual distribution histogram (skewness: 3.969, kurtosis: 36.788)',
        'Annual cost by age group and smoking status curve',
        'Pairwise Pearson correlation matrix heatmap',
        'Empirical Variance Inflation Factor (VIF) diagnostic table'
      ],
      icon: BarChart3
    },
    history: {
      phase: 'Phase 6 Preview',
      title: 'Prediction History & Audit Logs',
      desc: 'This module will provide a full SQLite database inspection table with pagination, model filtering, single-record deletion, and one-click CSV export.',
      features: [
        'Query prediction_history table via GET /api/history',
        'Filter by Model A vs Model B',
        'Inspect individual factor parameter JSON payloads',
        'Single-record deletion via DELETE /api/history/<id>',
        'Client-side CSV export of past predictions'
      ],
      icon: History
    }
  };

  const config = tabConfigs[tabId] || tabConfigs.estimator;
  const Icon = config.icon;

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <div className="p-8 sm:p-12 rounded-2xl bg-cream-50 border border-ink-200 shadow-card">
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center text-forest-700">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-medium text-forest-700 uppercase tracking-wider bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              {config.phase}
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-ink-900 mt-1 font-sans">
              {config.title}
            </h2>
          </div>
        </div>

        <p className="text-base text-ink-600 font-light leading-relaxed mt-4">
          {config.desc}
        </p>

        <div className="mt-8 pt-6 border-t border-ink-200/80">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-4 font-sans">
            Scheduled Implementation Modules:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.features.map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 text-sm text-ink-700 bg-cream-100 p-3 rounded-lg border border-ink-200/60">
                <CheckCircle2 className="w-4 h-4 text-forest-600 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink-200/80 flex items-center justify-between">
          <span className="text-xs text-ink-500 font-sans">
            Ready for phased implementation following your review.
          </span>
          <button
            onClick={onReturnToOverview}
            className="inline-flex items-center space-x-1.5 text-sm font-medium text-forest-700 hover:text-forest-800"
          >
            <span>Return to Overview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
