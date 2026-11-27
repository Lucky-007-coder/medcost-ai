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
import { AlertTriangle } from 'lucide-react';

export default function CoefficientChart({ metadata }) {
  const [activeModel, setActiveModel] = useState('model_b');

  const modelA = metadata?.model_a;
  const modelB = metadata?.model_b;
  const currentModel = activeModel === 'model_a' ? modelA : modelB;
  const coefficients = currentModel?.coefficients || [];
  const intercept = currentModel?.intercept || 0;

  // Include reference categories with 0.00 coefficient for complete transparency
  const referenceBaselines = activeModel === 'model_a'
    ? [
        { feature: 'sex_Female [Reference]', coefficient: 0.0, isBaseline: true },
        { feature: 'smoker_Never [Reference]', coefficient: 0.0, isBaseline: true },
        { feature: 'region_Central [Reference]', coefficient: 0.0, isBaseline: true }
      ]
    : [
        { feature: 'sex_Female [Reference]', coefficient: 0.0, isBaseline: true },
        { feature: 'smoker_Never [Reference]', coefficient: 0.0, isBaseline: true },
        { feature: 'region_Central [Reference]', coefficient: 0.0, isBaseline: true },
        { feature: 'plan_type_HMO [Reference]', coefficient: 0.0, isBaseline: true }
      ];

  // Prepare chart dataset: merge coefficients and baseline categories, sort descending
  const chartData = [
    ...coefficients.map(c => ({
      feature: c.feature,
      coefficient: c.coefficient,
      interpretation: c.interpretation,
      isBaseline: false
    })),
    ...referenceBaselines
  ].sort((a, b) => b.coefficient - a.coefficient);

  return (
    <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card p-6 sm:p-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#52B788]"></span>
            <span className="text-xs font-mono font-medium text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider bg-[#E6EFEA] dark:bg-[#080B09] px-2 py-0.5 rounded border border-[#CBE0D4] dark:border-[#1F2622]">
              Diagnostic G • Marginal Weights
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">
            Regression Coefficients (β) & Feature Weights
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-1">
            Fitted ordinary least squares weights showing ceteris paribus dollar adjustments per unit change.
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
            Model A (Core 6)
          </button>
          <button
            onClick={() => setActiveModel('model_b')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeModel === 'model_b'
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model B (Clinical 14)
          </button>
        </div>
      </div>

      {/* Model Intercept & Top Factor Callouts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-[#E6EFEA] dark:bg-[#080B09] border border-[#CBE0D4] dark:border-[#1F2622] rounded-xl">
          <span className="text-xs font-semibold text-[#1B4332] dark:text-[#52B788]">Fitted Intercept (β₀)</span>
          <p className="font-numeric text-2xl font-bold text-[#1B4332] dark:text-[#52B788] mt-1">
            ${intercept.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#2D6A4F] dark:text-[#95D5B2] mt-0.5 font-medium">
            Baseline expected charges for reference individual
          </p>
        </div>

        <div className="p-4 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
          <span className="text-xs font-semibold text-[#4B5563] dark:text-[#9CA3AF]">Largest Positive Factor</span>
          <p className="font-numeric text-2xl font-bold text-[#1B4332] dark:text-[#52B788] mt-1">
            {activeModel === 'model_a' ? '+$1,548.91' : '+$1,928.25'}
          </p>
          <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] mt-0.5 font-mono">
            {activeModel === 'model_a' ? 'smoker_Current' : 'hospitalizations_last_3yrs'}
          </p>
        </div>

        <div className="p-4 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
          <span className="text-xs font-semibold text-[#4B5563] dark:text-[#9CA3AF]">Reference Categories (β = $0.00)</span>
          <p className="text-xs text-[#111827] dark:text-[#FFFFFF] mt-1 font-mono font-medium">
            {activeModel === 'model_a' ? 'Female, Never, Central' : 'Female, Never, Central, HMO'}
          </p>
          <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF] mt-0.5">Omitted base levels to avoid dummy variable trap</p>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-[480px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 140, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
            <XAxis
              type="number"
              domain={['auto', 'auto']}
              tick={{ fontSize: 13, fill: '#4B5563', fontFamily: 'Space Grotesk' }}
              label={{
                value: 'Coefficient Impact on Annual Charges ($ USD)',
                position: 'insideBottom',
                offset: -10,
                fill: '#111827',
                fontSize: 13,
                fontFamily: 'Plus Jakarta Sans'
              }}
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
                    <div className="bg-[#112D22] text-white text-xs rounded-xl p-3.5 shadow-xl border border-[#52B788]/30 max-w-sm">
                      <p className="font-mono font-semibold text-[#E6EFEA]">{item.feature}</p>
                      <p className="mt-1 font-numeric text-base font-bold text-white">
                        Weight (β):{' '}
                        <span className={item.coefficient >= 0 ? 'text-[#52B788]' : 'text-[#F2D8C9]'}>
                          {item.coefficient >= 0 ? '+' : ''}${item.coefficient.toFixed(2)}
                        </span>
                      </p>
                      <p className="mt-2 text-[#E6EFEA]/80 text-[11px] leading-relaxed">
                        {item.interpretation || (item.isBaseline ? 'Reference category: fixed as $0.00 comparative baseline.' : '')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Zero vertical line */}
            <ReferenceLine x={0} stroke="#4B5563" strokeWidth={1.5} />
            <Bar dataKey="coefficient" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => {
                let fill = '#1B4332'; // Forest green for positive
                if (entry.isBaseline) {
                  fill = '#9CA3AF'; // Muted grey for reference
                } else if (entry.coefficient < 0) {
                  fill = '#D98C72'; // Soft coral for negative
                } else if (entry.coefficient > 1000) {
                  fill = '#112D22'; // Dark forest for heavy positive
                } else {
                  fill = '#2D6A4F';
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Academic Disclaimer on Association vs Causation */}
      <div className="bg-[#FBFBFA] dark:bg-[#080B09] border border-[#C9A66B]/40 dark:border-amber-800/40 rounded-xl p-4 sm:p-5 text-xs text-[#111827] dark:text-[#FFFFFF] space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-[#8B6528] dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 text-[#C9A66B] flex-shrink-0" />
          <span>Actuarial Note: Association vs. Causation</span>
        </div>
        <p className="leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
          In classical OLS Linear Regression, coefficients represent partial regression derivatives (
          <span className="font-mono">∂E[Y|X]/∂X_j</span>). While <span className="font-mono font-semibold text-[#111827] dark:text-[#FFFFFF]">smoker_Current (+$1,540.40)</span> and <span className="font-mono font-semibold text-[#111827] dark:text-[#FFFFFF]">hospitalizations_last_3yrs (+$1,928.25)</span> exhibit large positive associations with annual charges, these values describe observational correlations holding other covariates constant, not guaranteed individual medical cost trajectories or biological causation.
        </p>
      </div>
    </div>
  );
}
