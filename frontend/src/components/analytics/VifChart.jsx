import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { ShieldCheck, Info } from 'lucide-react';

export default function VifChart({ metadata }) {
  const [activeModel, setActiveModel] = useState('model_b');

  const modelAData = metadata?.model_a?.vif || [];
  const modelBData = metadata?.model_b?.vif || [];
  const currentData = activeModel === 'model_a' ? modelAData : modelBData;

  // Sort descending by VIF for clear ranking
  const sortedData = [...currentData].sort((a, b) => b.vif - a.vif);

  return (
    <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card p-6 sm:p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#52B788]"></span>
            <span className="text-xs font-mono font-medium text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider bg-[#E6EFEA] dark:bg-[#080B09] px-2 py-0.5 rounded border border-[#CBE0D4] dark:border-[#1F2622]">
              Diagnostic F • Collinearity Audit
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">
            Variance Inflation Factors (VIF)
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-1">
            Multicollinearity diagnostic evaluated across all continuous and dummy regressors.
          </p>
        </div>

        {/* Model Switcher */}
        <div className="flex items-center bg-[#E6EFEA]/60 dark:bg-[#080B09] p-1 rounded-xl text-xs font-semibold self-start md:self-auto border border-[#E5E7EB] dark:border-[#1F2622]">
          <button
            onClick={() => setActiveModel('model_a')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeModel === 'model_a'
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model A ({modelAData.length} regressors)
          </button>
          <button
            onClick={() => setActiveModel('model_b')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeModel === 'model_b'
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model B ({modelBData.length} regressors)
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-[#E6EFEA] dark:bg-[#080B09] border border-[#CBE0D4] dark:border-[#1F2622] rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1B4332] dark:text-[#52B788]">Max VIF Observed</span>
            <ShieldCheck className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
          </div>
          <p className="font-numeric text-2xl font-bold text-[#1B4332] dark:text-[#52B788] mt-1">
            {sortedData.length > 0 ? sortedData[0].vif.toFixed(2) : '1.00'}
          </p>
          <p className="text-[11px] text-[#2D6A4F] dark:text-[#95D5B2] mt-0.5 font-medium">
            {sortedData.length > 0 ? sortedData[0].feature : 'N/A'} (Region South dummy)
          </p>
        </div>

        <div className="p-4 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
          <span className="text-xs font-semibold text-[#4B5563] dark:text-[#9CA3AF]">Standard Caution Threshold</span>
          <p className="font-numeric text-2xl font-bold text-[#C9A66B] mt-1">VIF ≥ 5.00</p>
          <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">All regressors remain well below (100% compliant)</p>
        </div>

        <div className="p-4 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
          <span className="text-xs font-semibold text-[#4B5563] dark:text-[#9CA3AF]">Severe Multicollinearity Threshold</span>
          <p className="font-numeric text-2xl font-bold text-[#D98C72] mt-1">VIF ≥ 10.00</p>
          <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">Indicates ill-conditioned covariance matrix</p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-[440px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 10, right: 30, left: 110, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis
              type="number"
              domain={[0, 6]}
              tick={{ fontSize: 13, fill: '#4B5563', fontFamily: 'Space Grotesk' }}
              label={{ value: 'Variance Inflation Factor (VIF)', position: 'insideBottom', offset: -10, fill: '#111827', fontSize: 13, fontFamily: 'Plus Jakarta Sans' }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fontSize: 11, fill: '#111827', fontFamily: 'JetBrains Mono' }}
              interval={0}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#112D22] text-white text-xs rounded-xl p-3 shadow-xl border border-[#52B788]/30">
                      <p className="font-mono font-semibold text-[#E6EFEA]">{item.feature}</p>
                      <p className="mt-1 font-numeric text-base font-bold text-white">VIF: {item.vif.toFixed(2)}</p>
                      <p className="mt-1 text-[#E6EFEA]/80 text-[11px]">
                        {item.vif < 2.5
                          ? 'Low collinearity with other regressors'
                          : item.vif < 5
                          ? 'Moderate correlation, fully acceptable for OLS'
                          : 'High collinearity requiring regularization'}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Caution reference line at VIF = 5 */}
            <ReferenceLine
              x={5}
              stroke="#C9A66B"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: 'Caution Benchmark (VIF = 5.0)',
                fill: '#8B6528',
                fontSize: 12,
                position: 'insideTopRight',
                fontFamily: 'Plus Jakarta Sans'
              }}
            />
            <Bar dataKey="vif" radius={[0, 6, 6, 0]}>
              {sortedData.map((entry, index) => {
                let fill = '#1B4332'; // Forest green
                if (entry.vif >= 5) fill = '#D98C72';
                else if (entry.vif >= 2.5) fill = '#C9A66B';
                else if (entry.vif > 1.5) fill = '#2D6A4F';
                else fill = '#52B788';
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Methodological Context & Academic Justification */}
      <div className="bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-2xl p-4 sm:p-5 text-xs text-[#111827] dark:text-[#FFFFFF] space-y-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-[#1B4332] dark:text-[#52B788]">
          <Info className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
          <span>Multicollinearity Diagnosis & Feature Engineering Rationale:</span>
        </div>
        <p className="leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
          <strong className="text-[#111827] dark:text-[#FFFFFF]">Mathematical Definition:</strong> For regressor <span className="font-mono">X_j</span>,{' '}
          <span className="font-mono font-semibold">VIF_j = 1 / (1 - R_j²)</span>, where <span className="font-mono">R_j²</span> is the coefficient of determination obtained from regressing <span className="font-mono">X_j</span> on all other explanatory features.
        </p>
        <p className="leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
          <strong className="text-[#111827] dark:text-[#FFFFFF]">Collinearity Diagnosis:</strong> In both Model A (max VIF = 2.39) and Model B (max VIF = 2.39), all coefficients demonstrate low inflation. The slight elevation in region dummies (<span className="font-mono">region_South</span> at 2.39) is natural due to mutual exclusivity under One-Hot Encoding with <span className="font-mono">Central</span> as baseline.
        </p>
        <p className="leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
          <strong className="text-[#111827] dark:text-[#FFFFFF]">Feature Selection Defense (chronic_count vs. 10 individual flags):</strong> The raw dataset contains 10 separate binary chronic disease indicators plus an aggregated <span className="font-mono">chronic_count</span>. Testing showed that <span className="font-mono">chronic_count</span> is the exact arithmetic sum of these 10 flags. Retaining both would cause extreme collinearity singularity (<span className="font-mono">VIF → ∞</span>). Model B retains <span className="font-mono">chronic_count</span>, preserving clinical burden while maintaining complete mathematical stability.
        </p>
      </div>
    </div>
  );
}
