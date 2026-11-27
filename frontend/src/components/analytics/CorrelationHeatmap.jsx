import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function CorrelationHeatmap({ analyticsData }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!analyticsData || !analyticsData.correlation_matrix) return null;

  // Key subset of continuous features for focused actuarial insight
  const targetFeatures = [
    'annual_medical_cost', 'age', 'bmi', 'dependents', 
    'income', 'systolic_bp', 'hba1c', 'visits_last_year', 
    'hospitalizations_last_3yrs', 'chronic_count', 'deductible'
  ];

  const featureLabels = {
    'annual_medical_cost': 'Cost',
    'age': 'Age',
    'bmi': 'BMI',
    'dependents': 'Dep',
    'income': 'Income',
    'systolic_bp': 'Sys BP',
    'hba1c': 'HbA1c',
    'visits_last_year': 'Visits',
    'hospitalizations_last_3yrs': 'Hosp(3y)',
    'chronic_count': 'Chronic',
    'deductible': 'Deduct'
  };

  const featureFullNames = {
    'annual_medical_cost': 'Annual Medical Cost ($)',
    'age': 'Age (Years)',
    'bmi': 'Body Mass Index (BMI)',
    'dependents': 'Number of Dependents',
    'income': 'Household Income ($)',
    'systolic_bp': 'Systolic Blood Pressure',
    'hba1c': 'Glycated Hemoglobin (HbA1c)',
    'visits_last_year': 'Doctor Visits Last Year',
    'hospitalizations_last_3yrs': 'Hospitalizations (Past 3 Yrs)',
    'chronic_count': 'Diagnosed Chronic Conditions',
    'deductible': 'Policy Deductible ($)'
  };

  // Find row in matrix
  const getCorr = (rowFeat, colFeat) => {
    const rowObj = analyticsData.correlation_matrix.find((r) => r.feature === rowFeat);
    if (rowObj && rowObj[colFeat] !== undefined) {
      return Number(rowObj[colFeat]);
    }
    return 0;
  };

  // Cohesive diverging palette:
  // Positive correlations: Deep Forest & Emerald Sage
  // Neutral: Warm canvas off-white
  // Negative correlations: Soft peach / coral
  const getCellColor = (r) => {
    if (r === 1) return 'bg-[#112D22] text-white font-bold';
    if (r >= 0.5) return 'bg-[#1B4332] text-white font-semibold';
    if (r >= 0.25) return 'bg-[#2D6A4F] text-white';
    if (r >= 0.1) return 'bg-[#52B788]/40 text-[#1B4332] font-semibold';
    if (r > 0.02) return 'bg-[#E6EFEA] text-[#1B4332]';
    if (r >= -0.02) return 'bg-[#FBFBFA] text-[#6B7280]';
    if (r >= -0.1) return 'bg-[#F2D8C9]/60 text-[#8B4B32]';
    if (r >= -0.25) return 'bg-[#F2D8C9] text-[#7A3620] font-medium';
    return 'bg-[#D98C72] text-white font-semibold';
  };

  return (
    <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-card p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] dark:border-[#1F2622]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1B4332] dark:bg-[#52B788]"></span>
            <span className="text-xs font-mono font-medium text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider bg-[#E6EFEA] dark:bg-[#080B09] px-2 py-0.5 rounded border border-[#CBE0D4] dark:border-[#1F2622]">
              Diagnostic E • Covariance Structure
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#111827] dark:text-[#FFFFFF]">
            Pearson Correlation Matrix
          </h3>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-1">
            Pairwise linear correlations (<em>r</em>) across 100,000 policyholder observations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF] bg-[#FBFBFA] dark:bg-[#080B09] px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] self-start sm:self-auto">
          <span className="text-[11px] text-[#8B4B32] dark:text-rose-400 font-numeric font-medium">-0.25</span>
          <div className="flex h-3 w-28 rounded-md overflow-hidden shadow-inner">
            <span className="flex-1 bg-[#D98C72]" title="Negative" />
            <span className="flex-1 bg-[#F2D8C9]" />
            <span className="flex-1 bg-[#FBFBFA]" />
            <span className="flex-1 bg-[#52B788]" />
            <span className="flex-1 bg-[#2D6A4F]" />
            <span className="flex-1 bg-[#1B4332]" title="Positive" />
          </div>
          <span className="text-[11px] text-[#1B4332] dark:text-[#52B788] font-numeric font-semibold">+1.00</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] bg-[#FBFBFA] dark:bg-[#080B09] p-2 sm:p-4">
        <div className="min-w-[620px]">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-1 mb-1.5 text-[11px] font-mono font-semibold text-[#4B5563] dark:text-[#9CA3AF] text-center">
            <div className="text-left font-sans text-[#6B7280] dark:text-[#9CA3AF] pl-1 text-[11px] font-medium">Feature</div>
            {targetFeatures.map((col) => (
              <div key={col} className="truncate tracking-tight" title={featureFullNames[col]}>
                {featureLabels[col]}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {targetFeatures.map((rowFeat) => (
            <div key={rowFeat} className="grid grid-cols-12 gap-1 mb-1 items-center">
              {/* Row Label */}
              <div 
                className="text-left font-sans font-medium text-[#111827] dark:text-[#FFFFFF] text-xs truncate pr-1"
                title={featureFullNames[rowFeat]}
              >
                {featureLabels[rowFeat]}
              </div>

              {/* Matrix Cells */}
              {targetFeatures.map((colFeat) => {
                const r = getCorr(rowFeat, colFeat);
                const isHovered = hoveredCell && hoveredCell.row === rowFeat && hoveredCell.col === colFeat;

                return (
                  <div
                    key={colFeat}
                    onMouseEnter={() => setHoveredCell({ row: rowFeat, col: colFeat, val: r })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-8 sm:h-9 rounded-md flex items-center justify-center font-numeric text-[11px] sm:text-xs transition-all duration-150 cursor-pointer select-none ${getCellColor(r)} ${
                      isHovered ? 'ring-2 ring-[#1B4332] dark:ring-[#52B788] scale-110 z-10 shadow-md font-bold' : 'hover:opacity-90'
                    }`}
                  >
                    {r === 1 ? '1.0' : r.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Hover Inspector Banner */}
      <div className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#E6EFEA]/60 dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between text-xs font-sans transition-all">
        {hoveredCell ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#4B5563] dark:text-[#9CA3AF] font-medium">Inspecting:</span>
            <span className="font-semibold text-[#111827] dark:text-[#FFFFFF] bg-white dark:bg-[#0F1412] px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#1F2622]">
              {featureFullNames[hoveredCell.row]}
            </span>
            <span className="text-[#4B5563] dark:text-[#9CA3AF]">×</span>
            <span className="font-semibold text-[#111827] dark:text-[#FFFFFF] bg-white dark:bg-[#0F1412] px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#1F2622]">
              {featureFullNames[hoveredCell.col]}
            </span>
            <span className="text-[#4B5563] dark:text-[#9CA3AF] ml-2">Pearson r:</span>
            <strong className="font-numeric text-[#1B4332] dark:text-[#52B788] text-sm font-bold bg-[#E6EFEA] dark:bg-[#0F1412] px-2 py-0.5 rounded border border-[#CBE0D4] dark:border-[#1F2622]">
              {hoveredCell.val > 0 ? `+${hoveredCell.val.toFixed(3)}` : hoveredCell.val.toFixed(3)}
            </strong>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#9CA3AF] text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#52B788]" />
            <span>Hover over any correlation cell above to inspect the exact coefficient and feature pair.</span>
          </div>
        )}
      </div>

    </div>
  );
}
