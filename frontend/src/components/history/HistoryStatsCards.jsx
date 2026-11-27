import React from 'react';
import { Database, Activity, DollarSign, Clock, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

export default function HistoryStatsCards({ stats }) {
  if (!stats) return null;

  const total = stats.total_predictions || 0;
  const modelA = stats.model_a_count || 0;
  const modelB = stats.model_b_count || 0;
  const avgCost = stats.avg_predicted_cost || 0;
  const modelAPct = total > 0 ? ((modelA / total) * 100).toFixed(1) : 0;
  const modelBPct = total > 0 ? ((modelB / total) * 100).toFixed(1) : 0;

  // Animated counters
  const animatedTotal = useAnimatedCounter(total, { duration: 900, decimals: 0 });
  const animatedAvgCost = useAnimatedCounter(avgCost, { duration: 1100, decimals: 2, prefix: '$' });

  // Format latest timestamp
  const formatLatestTime = (iso) => {
    if (!iso) return 'No records yet';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const pieData = [
    { name: 'Model A — Basic', value: modelA, color: '#2D6A4F', pct: modelAPct },
    { name: 'Model B — Clinical', value: modelB, color: '#1B4332', pct: modelBPct }
  ].filter(d => d.value > 0);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#0F1412] p-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-md text-xs font-sans space-y-0.5">
          <div className="font-bold text-[#111827] dark:text-[#FFFFFF] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-[#1B4332] dark:text-[#52B788] font-numeric font-bold text-sm">
            {data.value} records ({data.pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Predictions */}
        <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-medium">Audit Volume</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6EFEA] dark:bg-[#080B09] flex items-center justify-center text-[#1B4332] dark:text-[#52B788]">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="font-numeric text-3xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-3">
            {animatedTotal}
          </p>
          <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
            Logged predictions in SQLite audit ledger
          </p>
        </div>

        {/* Model Distribution */}
        <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-medium">Model Mix</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6EFEA] dark:bg-[#080B09] flex items-center justify-center text-[#2D6A4F] dark:text-[#52B788]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="font-numeric text-2xl font-bold text-[#2D6A4F] dark:text-[#95D5B2]">{modelA}</span>
            <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-medium">Basic ({Math.round(modelAPct)}%)</span>
            <span className="text-[#E5E7EB] dark:text-[#1F2622]">/</span>
            <span className="font-numeric text-2xl font-bold text-[#1B4332] dark:text-[#52B788]">{modelB}</span>
            <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-medium">Clin ({Math.round(modelBPct)}%)</span>
          </div>
          {/* Visual distribution bar */}
          <div className="w-full h-1.5 bg-[#E6EFEA] dark:bg-[#080B09] rounded-full mt-2.5 overflow-hidden flex">
            <div 
              className="bg-[#2D6A4F] dark:bg-[#52B788] h-full transition-all duration-500" 
              style={{ width: `${modelAPct}%` }}
              title={`Model A: ${modelAPct}%`}
            />
            <div 
              className="bg-[#1B4332] dark:bg-[#95D5B2] h-full transition-all duration-500" 
              style={{ width: `${modelBPct}%` }}
              title={`Model B: ${modelBPct}%`}
            />
          </div>
        </div>

        {/* Average Inferred Cost */}
        <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-medium">Mean Inferred Cost</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6EFEA] dark:bg-[#080B09] flex items-center justify-center text-[#1B4332] dark:text-[#52B788]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-numeric text-2xl sm:text-3xl font-bold text-[#1B4332] dark:text-[#52B788] mt-3">
            {animatedAvgCost}
          </p>
          <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
            Session average prediction
          </p>
        </div>

        {/* Latest Activity */}
        <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF] font-medium">Most Recent Ingest</span>
            <div className="w-8 h-8 rounded-xl bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-center text-[#4B5563] dark:text-[#9CA3AF]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-numeric text-base sm:text-lg font-bold text-[#111827] dark:text-[#FFFFFF] mt-3 truncate">
            {formatLatestTime(stats.latest_timestamp)}
          </p>
          <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mt-1">
            Last logged audit event
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 text-xs text-[#4B5563] dark:text-[#9CA3AF] gap-1">
        <span>Session statistics calculated dynamically from persistent SQLite audit rows.</span>
        <span className="italic">Partitioned strictly from the 100,000-sample Kaggle holdout distribution.</span>
      </div>
    </div>
  );
}
