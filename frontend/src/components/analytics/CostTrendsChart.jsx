import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Info, PieChart as PieIcon, BarChart3 } from 'lucide-react';

export default function CostTrendsChart({ analyticsData }) {
  const [metricMode, setMetricMode] = useState('median'); // 'median' | 'mean'

  if (!analyticsData || !analyticsData.age_smoker_trends) return null;

  const rawTrends = analyticsData.age_smoker_trends;

  // Transform data for Recharts based on active metric (median vs mean)
  const chartData = rawTrends.map((item) => ({
    age_group: item.age_group,
    Never: metricMode === 'median' ? item.median_never : item.mean_never,
    Former: metricMode === 'median' ? item.median_former : item.mean_former,
    Current: metricMode === 'median' ? item.median_current : item.mean_current,
  }));

  // Calculate real empirical averages across all cohorts for the Donut Pie Chart (Image 1 Style)
  const count = rawTrends.length || 1;
  const avgNever = rawTrends.reduce((acc, r) => acc + (metricMode === 'median' ? r.median_never : r.mean_never), 0) / count;
  const avgFormer = rawTrends.reduce((acc, r) => acc + (metricMode === 'median' ? r.median_former : r.mean_former), 0) / count;
  const avgCurrent = rawTrends.reduce((acc, r) => acc + (metricMode === 'median' ? r.median_current : r.mean_current), 0) / count;
  const totalAvg = avgNever + avgFormer + avgCurrent;
  const overallCohortMean = totalAvg / 3;

  const pieData = [
    {
      name: 'Never Smoker',
      value: Math.round(avgNever),
      percentage: totalAvg > 0 ? ((avgNever / totalAvg) * 100).toFixed(1) : 0,
      color: '#52B788'
    },
    {
      name: 'Former Smoker',
      value: Math.round(avgFormer),
      percentage: totalAvg > 0 ? ((avgFormer / totalAvg) * 100).toFixed(1) : 0,
      color: '#C9A66B'
    },
    {
      name: 'Current Smoker',
      value: Math.round(avgCurrent),
      percentage: totalAvg > 0 ? ((avgCurrent / totalAvg) * 100).toFixed(1) : 0,
      color: '#D98C72'
    }
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#0F1412] p-3 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-lg text-xs font-sans space-y-1">
          <div className="font-bold text-[#111827] dark:text-[#FFFFFF] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-[#1B4332] dark:text-[#52B788] font-numeric font-bold text-sm">
            ${data.value.toLocaleString()} <span className="text-xs font-normal text-[#4B5563] dark:text-[#9CA3AF]">cohort avg</span>
          </div>
          <div className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
            Relative Cost Burden: <strong className="text-[#111827] dark:text-[#FFFFFF] font-numeric">{data.percentage}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] dark:border-[#1F2622]">
        <div>
          <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
            Diagnostic Section D • Population Demographics
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-1">
            Annual Expenditure Across Age & Smoking Brackets
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] font-light mt-0.5">
            Empirical population distributions comparing Never, Former, and Current smokers across 100k records
          </p>
        </div>

        {/* Median vs Mean Toggle */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#E6EFEA]/60 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setMetricMode('median')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              metricMode === 'median'
                ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Median Cost (Robust)
          </button>
          <button
            onClick={() => setMetricMode('mean')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              metricMode === 'mean'
                ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Mean Cost (With Outliers)
          </button>
        </div>
      </div>

      {/* Dual Visuals: Bar Chart + Donut Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788]" />
              <span>Age Group Trends by Smoking Status</span>
            </span>
            <span className="text-[11px] font-mono text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2 py-0.5 rounded font-semibold border border-transparent dark:border-[#1F2622]">
              {metricMode === 'median' ? 'Median Values' : 'Mean Values'}
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 15, right: 15, bottom: 20, left: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis 
                  dataKey="age_group" 
                  tick={{ fontSize: 12, fill: '#4B5563', fontFamily: 'Space Grotesk' }}
                  label={{ value: 'Age Bracket (Years)', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#111827', fontFamily: 'Plus Jakarta Sans' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#4B5563', fontFamily: 'Space Grotesk' }}
                  unit="$"
                  label={{ value: `${metricMode === 'median' ? 'Median' : 'Mean'} ($)`, angle: -90, position: 'insideLeft', offset: -5, fontSize: 12, fill: '#111827', fontFamily: 'Plus Jakarta Sans' }}
                />
                <Tooltip 
                  formatter={(val, name) => [`$${val.toLocaleString()}`, `${name} Smoker`]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '12px', fontSize: '12px', fontFamily: 'Plus Jakarta Sans', boxShadow: '0 8px 20px -4px rgba(27, 67, 50, 0.08)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={32}
                  formatter={(val) => <span className="text-xs font-sans text-[#111827] dark:text-[#FFFFFF] font-semibold mr-3">{val}</span>}
                />
                <Bar dataKey="Never" fill="#52B788" radius={[6, 6, 0, 0]} name="Never" />
                <Bar dataKey="Former" fill="#C9A66B" radius={[6, 6, 0, 0]} name="Former" />
                <Bar dataKey="Current" fill="#D98C72" radius={[6, 6, 0, 0]} name="Current" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Pie Chart */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-2xl p-6 sm:p-7 flex flex-col justify-between overflow-visible">
          <div className="space-y-1 pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#1B4332] dark:text-[#52B788] font-semibold flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-[#52B788]" />
              <span>Smoking Cost Share</span>
            </span>
            <h4 className="font-serif text-lg font-bold text-[#111827] dark:text-[#FFFFFF]">
              Relative Cohort Burden
            </h4>
            <p className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
              Proportional spend calculated across 100k empirical observations
            </p>
          </div>

          {/* Donut Canvas with Full Margin & No Clipping */}
          <div className="relative py-3 my-auto w-full flex items-center justify-center overflow-visible">
            <div className="h-48 w-full max-w-[240px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centered Value inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">Cohort Avg</span>
              <span className="font-numeric text-base sm:text-lg font-bold text-[#111827] dark:text-[#FFFFFF]">
                ${Math.round(overallCohortMean).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Donut Legend with Generous Spacing */}
          <div className="space-y-2 pt-3 border-t border-[#E5E7EB] dark:border-[#1F2622] w-full">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#111827] dark:text-[#FFFFFF] font-medium text-xs truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-numeric text-xs flex-shrink-0">
                  <span className="text-[#4B5563] dark:text-[#9CA3AF]">${item.value.toLocaleString()}</span>
                  <span className="font-bold text-[#111827] dark:text-[#FFFFFF] min-w-[42px] text-right">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Non-Causal Actuarial Footnote */}
      <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] flex items-start space-x-2 text-xs text-[#4B5563] dark:text-[#9CA3AF] font-sans">
        <Info className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong className="text-[#111827] dark:text-[#FFFFFF]">Actuarial Observation:</strong> Current smokers consistently exhibit higher healthcare expenditure across every adult age bracket. 
          In the 55–64 bracket, median costs exceed never-smokers by over $1,500. 
          These values represent observed empirical sample distributions, strictly separate from biological causation claims.
        </span>
      </div>

    </div>
  );
}
