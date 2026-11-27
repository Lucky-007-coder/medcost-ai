import React, { useState } from 'react';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';

export default function ModelPerformanceOverview({ metadata }) {
  const [activeModel, setActiveModel] = useState('model_b');

  if (!metadata) return null;

  const modelA = metadata.model_a;
  const modelB = metadata.model_b;
  const current = activeModel === 'model_b' ? modelB : modelA;

  const testR2 = current?.metrics_test?.r2 ? current.metrics_test.r2 * 100 : 0;
  const testAdjR2 = current?.metrics_test?.adjusted_r2 ? current.metrics_test.adjusted_r2 * 100 : 0;
  const testMae = current?.metrics_test?.mae || 0;
  const testRmse = current?.metrics_test?.rmse || 0;

  const animatedR2 = useAnimatedCounter(testR2, { duration: 900, decimals: 2, suffix: '%' });
  const animatedAdjR2 = useAnimatedCounter(testAdjR2, { duration: 900, decimals: 2, suffix: '%' });
  const animatedMae = useAnimatedCounter(testMae, { duration: 900, decimals: 2, prefix: '$' });
  const animatedRmse = useAnimatedCounter(testRmse, { duration: 900, decimals: 2, prefix: '$' });

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-8">
      
      {/* Section Header with Model Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] dark:border-[#1F2622]">
        <div>
          <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
            Diagnostic Section A • Statistical Metrics
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-1">
            Model Performance & Validation Comparison
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] font-light mt-1">
            Evaluated on identical 80,000 train / 20,000 holdout test partitions (Random Seed: 42)
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#E6EFEA]/60 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveModel('model_a')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeModel === 'model_a'
                ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model A (Core 6)
          </button>
          <button
            onClick={() => setActiveModel('model_b')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeModel === 'model_b'
                ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model B (Clinical 14)
          </button>
        </div>
      </div>

      {/* Primary Comparison Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* R-Squared */}
        <div className="p-5 rounded-2xl bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] space-y-2">
          <span className="text-xs font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-semibold block">
            Holdout Test R²
          </span>
          <div className="font-numeric text-3xl sm:text-4xl font-bold text-[#1B4332] dark:text-[#52B788]">
            {animatedR2}
          </div>
          <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-mono">
            Train: {(current.metrics_train.r2 * 100).toFixed(2)}%
          </div>
          <div className="text-[11px] font-semibold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#0F1412] px-2 py-0.5 rounded-md inline-block border border-[#CBE0D4] dark:border-[#1F2622]">
            {activeModel === 'model_b' ? 'ΔR²: +12.35% abs (+271.8% rel)' : 'Baseline Reference'}
          </div>
        </div>

        {/* Adjusted R-Squared */}
        <div className="p-5 rounded-2xl bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] space-y-2">
          <span className="text-xs font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-semibold block">
            Adjusted R²
          </span>
          <div className="font-numeric text-3xl sm:text-4xl font-bold text-[#1B4332] dark:text-[#52B788]">
            {animatedAdjR2}
          </div>
          <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-mono">
            Train: {(current.metrics_train.adjusted_r2 * 100).toFixed(2)}%
          </div>
          <div className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] font-sans">
            Penalizes {current.features.length} parameters
          </div>
        </div>

        {/* Mean Absolute Error (MAE) */}
        <div className="p-5 rounded-2xl bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] space-y-2">
          <span className="text-xs font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-semibold block">
            Holdout Test MAE
          </span>
          <div className="font-numeric text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#FFFFFF]">
            {animatedMae}
          </div>
          <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-mono">
            Train: ${current.metrics_train.mae.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-semibold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#0F1412] px-2 py-0.5 rounded-md inline-block border border-[#CBE0D4] dark:border-[#1F2622]">
            {activeModel === 'model_b' ? '-$155.48 Error vs A' : 'Base Error'}
          </div>
        </div>

        {/* Root Mean Squared Error (RMSE) */}
        <div className="p-5 rounded-2xl bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] space-y-2">
          <span className="text-xs font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-semibold block">
            Holdout Test RMSE
          </span>
          <div className="font-numeric text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#FFFFFF]">
            {animatedRmse}
          </div>
          <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-mono">
            Train: ${current.metrics_train.rmse.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] font-sans">
            Reflects heavy acute claim tails
          </div>
        </div>

        {/* Mean Squared Error (MSE) */}
        <div className="p-5 rounded-2xl bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] space-y-2 col-span-2 lg:col-span-1">
          <span className="text-xs font-numeric uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-semibold block">
            Holdout Test MSE
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] truncate">
            {current.metrics_test.mse.toExponential(2)}
          </div>
          <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-mono">
            Train: {current.metrics_train.mse.toExponential(2)}
          </div>
          <div className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] font-sans">
            Quadratic OLS loss metric
          </div>
        </div>

      </div>

      {/* Side-by-Side Model Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#0F1412] shadow-xs">
        <table className="min-w-full divide-y divide-[#E5E7EB] dark:divide-[#1F2622] text-xs font-sans">
          <thead className="bg-[#E6EFEA]/60 dark:bg-[#080B09] text-[#111827] dark:text-[#FFFFFF] font-numeric font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5 text-left">Actuarial Metric</th>
              <th className="px-5 py-3.5 text-center">Model A (Train)</th>
              <th className="px-5 py-3.5 text-center bg-[#E6EFEA]/30 dark:bg-[#1B4332]/20 text-[#1B4332] dark:text-[#52B788]">Model A (Holdout Test)</th>
              <th className="px-5 py-3.5 text-center">Model B (Train)</th>
              <th className="px-5 py-3.5 text-center bg-[#E6EFEA] dark:bg-[#1B4332]/60 font-bold text-[#1B4332] dark:text-[#52B788]">Model B (Holdout Test)</th>
              <th className="px-5 py-3.5 text-right">Lift / Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2622] text-[#111827] dark:text-[#FFFFFF]">
            <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714]">
              <td className="px-5 py-3 font-semibold text-[#111827] dark:text-[#FFFFFF]">Model Scope & Variables</td>
              <td className="px-5 py-3 text-center text-[#4B5563] dark:text-[#9CA3AF]">6 Core Demographics</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/20 dark:bg-[#1B4332]/10 font-mono">11 encoded cols</td>
              <td className="px-5 py-3 text-center text-[#4B5563] dark:text-[#9CA3AF]">14 Clinical & Intake</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/40 dark:bg-[#1B4332]/30 font-mono font-bold text-[#1B4332] dark:text-[#52B788]">21 encoded cols</td>
              <td className="px-5 py-3 text-right font-numeric font-semibold text-[#1B4332] dark:text-[#52B788]">+8 Clinical Features</td>
            </tr>
            <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714]">
              <td className="px-5 py-3 font-semibold text-[#111827] dark:text-[#FFFFFF]">R² (Explained Variance)</td>
              <td className="px-5 py-3 text-center font-numeric">{(modelA.metrics_train.r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/20 dark:bg-[#1B4332]/10 font-numeric font-bold">{(modelA.metrics_test.r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-center font-numeric">{(modelB.metrics_train.r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/40 dark:bg-[#1B4332]/30 font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm">{(modelB.metrics_test.r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-right font-numeric font-bold text-[#1B4332] dark:text-[#52B788]">+12.35% abs (+271.8% rel)</td>
            </tr>
            <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714]">
              <td className="px-5 py-3 font-semibold text-[#111827] dark:text-[#FFFFFF]">Adjusted R² (Degrees of Freedom)</td>
              <td className="px-5 py-3 text-center font-numeric">{(modelA.metrics_train.adjusted_r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/20 dark:bg-[#1B4332]/10 font-numeric font-bold">{(modelA.metrics_test.adjusted_r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-center font-numeric">{(modelB.metrics_train.adjusted_r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/40 dark:bg-[#1B4332]/30 font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm">{(modelB.metrics_test.adjusted_r2 * 100).toFixed(2)}%</td>
              <td className="px-5 py-3 text-right font-numeric font-bold text-[#1B4332] dark:text-[#52B788]">+12.32% abs lift</td>
            </tr>
            <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714]">
              <td className="px-5 py-3 font-semibold text-[#111827] dark:text-[#FFFFFF]">Mean Absolute Error (MAE)</td>
              <td className="px-5 py-3 text-center font-numeric">${modelA.metrics_train.mae.toFixed(2)}</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/20 dark:bg-[#1B4332]/10 font-numeric font-bold">${modelA.metrics_test.mae.toFixed(2)}</td>
              <td className="px-5 py-3 text-center font-numeric">${modelB.metrics_train.mae.toFixed(2)}</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/40 dark:bg-[#1B4332]/30 font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm">${modelB.metrics_test.mae.toFixed(2)}</td>
              <td className="px-5 py-3 text-right font-numeric font-bold text-[#1B4332] dark:text-[#52B788]">-$155.48 (-8.0% error)</td>
            </tr>
            <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714]">
              <td className="px-5 py-3 font-semibold text-[#111827] dark:text-[#FFFFFF]">Root Mean Squared Error (RMSE)</td>
              <td className="px-5 py-3 text-center font-numeric">${modelA.metrics_train.rmse.toFixed(2)}</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/20 dark:bg-[#1B4332]/10 font-numeric font-bold">${modelA.metrics_test.rmse.toFixed(2)}</td>
              <td className="px-5 py-3 text-center font-numeric">${modelB.metrics_train.rmse.toFixed(2)}</td>
              <td className="px-5 py-3 text-center bg-[#E6EFEA]/40 dark:bg-[#1B4332]/30 font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm">${modelB.metrics_test.rmse.toFixed(2)}</td>
              <td className="px-5 py-3 text-right font-numeric font-bold text-[#1B4332] dark:text-[#52B788]">-$205.16 (-6.7% error)</td>
            </tr>
            <tr className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714]">
              <td className="px-5 py-3 font-semibold text-[#111827] dark:text-[#FFFFFF]">Fitted Baseline Intercept (β₀)</td>
              <td colSpan={2} className="px-5 py-3 text-center font-mono font-bold text-[#111827] dark:text-[#FFFFFF]">${modelA.intercept.toFixed(2)}</td>
              <td colSpan={2} className="px-5 py-3 text-center font-mono font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA]/30 dark:bg-[#1B4332]/20">${modelB.intercept.toFixed(2)}</td>
              <td className="px-5 py-3 text-right font-numeric text-[#4B5563] dark:text-[#9CA3AF]">Reference: Female, Never, Central, HMO</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
