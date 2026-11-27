import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#E6EFEA]/40 dark:bg-[#080B09]/80 border-t border-[#E5E7EB] dark:border-[#1F2622] mt-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Project Synopsis */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#111827] dark:text-[#FFFFFF]">
                MedCost<span className="text-[#1B4332] dark:text-[#52B788] italic">.ai</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase bg-[#E6EFEA] dark:bg-[#000000] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
                Major Project
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed max-w-xl">
              An actuarial healthcare analytics platform built for university major project evaluation. 
              Estimates annual medical expenditures using Ordinary Least Squares (OLS) Linear Regression, 
              providing complete mathematical transparency into regression weights (β) and feature contributions without black-box approximations.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-[#4B5563] dark:text-[#9CA3AF]">
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-xs">
                Python 3.12 • Flask REST API
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-xs">
                Scikit-Learn OLS
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-xs">
                React 19 • Vite • Recharts
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-xs">
                ReportLab PDF Engine
              </span>
            </div>
          </div>

          {/* Dataset & Methodology */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111827] dark:text-[#FFFFFF] font-numeric">
              Dataset & Specification
            </h4>
            <ul className="space-y-2.5 text-sm text-[#4B5563] dark:text-[#9CA3AF]">
              <li>
                <a 
                  href="https://www.kaggle.com/datasets/mohankrishnathalla/medical-insurance-cost-prediction"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#1B4332] dark:hover:text-[#52B788] flex items-center space-x-1.5 transition-colors font-medium text-[#111827] dark:text-[#FFFFFF]"
                >
                  <span>Mohan Krishna Thalla (100k)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#52B788]" />
                </a>
              </li>
              <li className="font-mono text-xs">Baseline Sex: Female (β=$0.00)</li>
              <li className="font-mono text-xs">Baseline Smoker: Never (β=$0.00)</li>
              <li className="font-mono text-xs">Baseline Region: Central (β=$0.00)</li>
              <li className="font-mono text-xs">Baseline Plan: HMO (β=$0.00)</li>
            </ul>
          </div>

          {/* Academic Viva Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#111827] font-numeric">
              Academic Viva Defense
            </h4>
            <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs text-xs space-y-2">
              <div className="flex items-center space-x-1.5 font-semibold text-[#1B4332]">
                <Shield className="w-4 h-4 text-[#1B4332] flex-shrink-0" />
                <span>Association vs. Causation</span>
              </div>
              <p className="text-[12px] leading-relaxed text-[#4B5563]">
                Calculated OLS partial derivatives reflect statistical correlations within the 100,000 observational records, not guaranteed individual medical etiology or biological causation.
              </p>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-center text-xs text-[#4B5563] gap-3">
          <p>© 2026 B.Tech Major Project in Machine Learning & Actuarial Health Informatics.</p>
          <p className="font-mono text-[11px]">Strict OLS Linear Architecture • Seed 42 80/20 Holdout Partition</p>
        </div>
      </div>
    </footer>
  );
}
