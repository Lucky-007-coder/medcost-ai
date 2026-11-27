import React, { useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Info } from 'lucide-react';

export default function ActualVsPredictedPlot({ analyticsData, metadata }) {
  const [modelType, setModelType] = useState('model_b');

  if (!analyticsData) return null;

  const pointsA = analyticsData.actual_vs_predicted_sample_a || [];
  const pointsB = analyticsData.actual_vs_predicted_sample_b || analyticsData.actual_vs_predicted_sample || [];
  
  const currentPoints = modelType === 'model_b' ? pointsB : pointsA;
  const currentMeta = metadata ? (modelType === 'model_b' ? metadata.model_b : metadata.model_a) : null;

  // Custom Editorial Tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] rounded-2xl shadow-elevated text-xs font-sans space-y-1.5 min-w-[200px]">
          <div className="font-semibold text-[#111827] dark:text-[#FFFFFF] border-b border-[#E5E7EB] dark:border-[#1F2622] pb-1 font-sans text-xs">
            Holdout Test Observation
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[#4B5563] dark:text-[#9CA3AF] font-numeric text-xs">
            <span>Actual Cost:</span>
            <strong className="text-[#111827] dark:text-[#FFFFFF] font-bold">${data.actual?.toLocaleString()}</strong>
            <span>Predicted:</span>
            <strong className="text-[#1B4332] dark:text-[#52B788] font-bold">${data.predicted?.toLocaleString()}</strong>
            <span>Residual (e):</span>
            <span className={data.residual >= 0 ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-blue-700 dark:text-blue-400 font-bold'}>
              ${data.residual?.toLocaleString()}
            </span>
            {data.age && (
              <>
                <span>Age:</span>
                <span className="text-[#111827] dark:text-[#FFFFFF]">{data.age} yrs</span>
              </>
            )}
            {data.smoker && (
              <>
                <span>Smoker:</span>
                <span className="text-[#111827] dark:text-[#FFFFFF]">{data.smoker}</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] shadow-card space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] dark:border-[#1F2622]">
        <div>
          <span className="text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider block">
            Diagnostic Section B • Scatter Geometry
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-1">
            Actual vs. Predicted Medical Expenditure
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] font-light mt-0.5">
            Holdout observations plotted against the 45° line of identity (y = x)
          </p>
        </div>

        {/* Model Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl bg-[#E6EFEA]/60 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setModelType('model_a')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              modelType === 'model_a'
                ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model A (R² = 4.54%)
          </button>
          <button
            onClick={() => setModelType('model_b')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              modelType === 'model_b'
                ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-xs font-bold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model B (R² = 16.90%)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 sm:h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 25, left: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              type="number" 
              dataKey="actual" 
              name="Actual Cost" 
              unit="$"
              domain={[0, 25000]}
              tick={{ fontSize: 13, fill: '#4B5563', fontFamily: 'Space Grotesk' }}
              label={{ value: 'Actual Annual Cost (USD)', position: 'insideBottom', offset: -15, fontSize: 13, fill: '#111827', fontFamily: 'Plus Jakarta Sans' }}
            />
            <YAxis 
              type="number" 
              dataKey="predicted" 
              name="Predicted Cost" 
              unit="$"
              domain={[0, 15000]}
              tick={{ fontSize: 13, fill: '#4B5563', fontFamily: 'Space Grotesk' }}
              label={{ value: 'Predicted Cost (USD)', angle: -90, position: 'insideLeft', offset: -10, fontSize: 13, fill: '#111827', fontFamily: 'Plus Jakarta Sans' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Ideal y = x Line */}
            <ReferenceLine 
              segment={[{ x: 0, y: 0 }, { x: 15000, y: 15000 }]} 
              stroke="#2D6A4F" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              label={{ value: 'Ideal Fit (y = x)', position: 'top', fill: '#1B4332', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
            />

            <Scatter 
              name="Policyholders" 
              data={currentPoints} 
              fill={modelType === 'model_b' ? '#1B4332' : '#52B788'} 
              opacity={0.7} 
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Sampling & Academic Footnote */}
      <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#1F2622] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] gap-3 font-sans">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0" />
          <span>
            <strong className="text-[#111827] dark:text-[#FFFFFF]">Sampling Specification:</strong> Plot reflects 400 evenly stratified holdout observations from the 20,000 test partition for responsive interactive exploration.
          </span>
        </div>
        <div className="font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-xs sm:text-sm flex-shrink-0">
          Model {modelType === 'model_b' ? 'B' : 'A'} Test MAE: ${currentMeta?.metrics_test?.mae.toFixed(2)}
        </div>
      </div>

    </div>
  );
}
