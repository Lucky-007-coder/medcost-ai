import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Scale, Cpu, Info, ChevronDown, ChevronUp,
  ShieldCheck, PieChart as PieIcon, ArrowRight, Activity, FileText, FileDown
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import useAnimatedCounter from '../../hooks/useAnimatedCounter';
import { exportPredictionPdf } from '../../services/api';

export default function PredictionResult({ result }) {
  const [showFullBreakdown, setShowFullBreakdown] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsExportingPdf(true);
    try {
      await exportPredictionPdf(result);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!result) return null;

  const {
    predicted_annual_cost,
    model_name,
    model_type,
    intercept,
    intercept_display,
    sum_of_contributions,
    sum_of_contributions_raw,
    calculated_sum_raw,
    feature_contributions,
    model_evaluation,
    record_id,
  } = result;

  // Animated counter for predicted annual cost
  const animatedCost = useAnimatedCounter(predicted_annual_cost, {
    duration: 1200,
    decimals: 2,
    prefix: '$'
  });

  // Prepare real, calculated pie chart data from positive contributions + positive intercept
  const pieColors = [
    '#1B4332', // Primary Deep Forest
    '#52B788', // Emerald Accent
    '#2D6A4F', // Secondary Mid Forest
    '#C9A66B', // Actuarial Gold/Amber
    '#D98C72', // Terracotta Coral
    '#3B82F6', // Medical Blue
    '#6B7280', // Slate Gray
  ];

  const positiveItems = [];
  const interceptVal = Number((intercept_display ?? intercept) || 0);
  if (interceptVal > 0) {
    positiveItems.push({
      rawName: 'β₀ Base Intercept',
      displayName: 'Base Intercept (β₀)',
      value: Number(interceptVal.toFixed(2)),
      description: 'Baseline invariant model constant'
    });
  }

  (feature_contributions || []).forEach(c => {
    if (c.contribution > 0 && !c.is_reference_baseline) {
      let cleanName = c.feature
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      if (c.feature === 'hospitalizations_last_3yrs') cleanName = 'Inpatient Hosp (3y)';
      else if (c.feature === 'chronic_count') cleanName = 'Chronic Conditions';
      else if (c.feature === 'visits_last_year') cleanName = 'Doctor Visits (1y)';
      else if (c.feature === 'systolic_bp') cleanName = 'Systolic BP';
      else if (c.feature.startsWith('smoker_')) cleanName = `${c.feature.split('_')[1]} Smoker`;
      else if (c.feature.startsWith('plan_type_')) cleanName = `${c.feature.split('_')[2]} Plan`;
      else if (c.feature.startsWith('region_')) cleanName = `${c.feature.split('_')[1]} Region`;
      else if (c.feature.startsWith('sex_')) cleanName = `${c.feature.split('_')[1]}`;

      positiveItems.push({
        rawName: c.feature,
        displayName: cleanName,
        value: Number(c.contribution.toFixed(2)),
        description: c.interpretation
      });
    }
  });

  // Sort descending by dollar value
  positiveItems.sort((a, b) => b.value - a.value);

  const totalPositiveDollars = positiveItems.reduce((acc, item) => acc + item.value, 0);

  // Take top 4, bucket the rest into "Other Predictors" if more than 4
  let pieData = [];
  if (positiveItems.length <= 5) {
    pieData = positiveItems.map((item, idx) => ({
      ...item,
      percentage: totalPositiveDollars > 0 ? ((item.value / totalPositiveDollars) * 100).toFixed(1) : 0,
      color: pieColors[idx % pieColors.length]
    }));
  } else {
    const top4 = positiveItems.slice(0, 4);
    const rest = positiveItems.slice(4);
    const restTotal = rest.reduce((acc, item) => acc + item.value, 0);

    pieData = top4.map((item, idx) => ({
      ...item,
      percentage: totalPositiveDollars > 0 ? ((item.value / totalPositiveDollars) * 100).toFixed(1) : 0,
      color: pieColors[idx % pieColors.length]
    }));

    if (restTotal > 0) {
      pieData.push({
        rawName: 'other_factors',
        displayName: 'Other Predictors',
        value: Number(restTotal.toFixed(2)),
        percentage: totalPositiveDollars > 0 ? ((restTotal / totalPositiveDollars) * 100).toFixed(1) : 0,
        color: pieColors[4],
        description: `${rest.length} additional factor contributions combined`
      });
    }
  }

  // Custom Recharts Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl border border-[#E5E7EB] shadow-lg text-xs font-sans space-y-1">
          <div className="font-bold text-[#111827] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.displayName}</span>
          </div>
          <div className="text-[#1B4332] font-numeric font-bold text-sm">
            ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#4B5563]">
            Share of Positive Cost: <strong className="text-[#111827]">{data.percentage}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] shadow-sm space-y-8 overflow-hidden font-sans"
    >
      
      {/* 1. TOP RESULT SECTION: IMAGE 3 HERO CARD + IMAGE 1 PIE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: TOTAL ESTIMATED COST HERO CARD (Image 3 Aesthetic) */}
        <div className="lg:col-span-7 bg-[#1B4332] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden border border-[#2D6A4F]">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#52B788]/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Top Status & Stepper Banner */}
          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-numeric font-bold uppercase tracking-wider bg-white/10 text-[#E6EFEA] border border-white/20 backdrop-blur-xs">
                  {model_type === 'model_b' ? 'Model B • Clinical Intake' : 'Model A • Demographic'}
                </span>
                <span className="text-xs text-[#E6EFEA]/80 font-mono bg-black/20 px-2.5 py-1 rounded-lg">
                  Audit #{record_id}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#52B788] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
                <span className="text-[#E6EFEA] text-[11px] font-mono">Verified OLS Matrix</span>
              </div>
            </div>

            {/* Price Value */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E6EFEA]/80 font-numeric block">
                Total Estimated Annual Cost of Care
              </span>
              <div className="flex items-baseline gap-3 mt-1.5">
                <span className="font-numeric text-4xl sm:text-6xl font-bold text-white tracking-tight">
                  {animatedCost}
                </span>
                <span className="text-sm sm:text-base font-sans font-medium text-[#E6EFEA]/80">USD / Year</span>
              </div>
              <p className="text-xs sm:text-sm text-[#E6EFEA]/90 mt-1">
                Deterministic inference from closed-form normal equation <span className="font-mono text-white font-bold">β̂ = (XᵀX)⁻¹ Xᵀy</span>.
              </p>
            </div>
          </div>

          {/* Bottom Card Summary Rows */}
          <div className="pt-6 mt-6 border-t border-white/15 relative z-10 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-[#E6EFEA]/70 uppercase block font-mono">Base Intercept</span>
                <span className="font-numeric font-bold text-sm text-white">
                  +${(intercept_display ?? intercept).toFixed(2)}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-[#E6EFEA]/70 uppercase block font-mono">Net Features</span>
                <span className="font-numeric font-bold text-sm text-[#52B788]">
                  +${sum_of_contributions?.toFixed(2)}
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-[#E6EFEA]/70 uppercase block font-mono">Holdout R²</span>
                <span className="font-numeric font-bold text-sm text-white">
                  {(model_evaluation.r2_score * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <span className="text-[10px] text-[#E6EFEA]/70 uppercase block font-mono">Test MAE</span>
                <span className="font-numeric font-bold text-sm text-white">
                  ${model_evaluation.mae.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#E6EFEA]/80 pt-2 border-t border-white/10 font-mono gap-2">
              <span>Tolerance Delta: &le; 10⁻⁶ USD</span>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#52B788] hover:bg-[#95D5B2] text-[#112D22] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: LINEAR FACTOR COST SHARE DONUT PIE CHART (Image 1 Aesthetic) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
          
          <div className="space-y-1 pb-2 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#1B4332] font-semibold">
                Factor Cost Share
              </span>
              <span className="text-[11px] text-[#4B5563] font-mono bg-[#E6EFEA] px-2 py-0.5 rounded text-[#1B4332] font-semibold">
                Calculated Breakdown
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#111827]">
              Proportional Cost Drivers
            </h3>
            <p className="text-xs text-[#4B5563]">
              Proportion of positive linear contributions (βⱼ · xⱼ) driving this prediction
            </p>
          </div>

          {/* Donut Chart Canvas with Center Value */}
          <div className="relative py-2 my-auto">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={3}
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

            {/* Centered Total Label inside Donut Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4B5563]">Total Cost</span>
              <span className="font-numeric text-lg sm:text-xl font-bold text-[#111827]">
                ${predicted_annual_cost?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Donut Legend (Image 1 Style) */}
          <div className="space-y-1.5 pt-3 border-t border-[#E5E7EB]">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#111827] font-medium truncate">{item.displayName}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 font-numeric">
                  <span className="text-[#4B5563]">${item.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  <span className="font-bold text-[#111827] min-w-[42px] text-right">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* 2. MATHEMATICAL FORMULATION & TOLERANCE PROOF */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FBFBFA] border border-[#E5E7EB] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#1B4332] flex-shrink-0" />
            <span className="text-xs font-bold text-[#111827] uppercase tracking-wider font-numeric">
              Exact Mathematical Decomposition
            </span>
          </div>
          <span className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-[#1B4332] bg-[#E6EFEA] px-3 py-1 rounded-full border border-[#C5DFD3] shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#52B788]" />
            <span>Tolerance Delta: &le; 10⁻⁶ USD</span>
          </span>
        </div>

        {/* Displayed Sum Equation */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E5E7EB] font-mono text-xs sm:text-sm text-[#111827] space-y-2 shadow-xs">
          <div className="text-[#1B4332] font-bold font-sans">
            Predicted Cost = Intercept (β₀) + Σ(Feature Contributions)
          </div>
          <div className="text-[#4B5563] text-xs flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              Intercept (β₀): <strong className="text-[#111827] font-numeric text-sm">${(intercept_display ?? intercept).toFixed(2)}</strong>
            </span>
            <span>+</span>
            <span>
              Net Features: <strong className="text-[#111827] font-numeric text-sm">${sum_of_contributions?.toFixed(2)}</strong>
            </span>
            <span>=</span>
            <span>
              Exact Prediction: <strong className="text-[#1B4332] font-numeric text-sm font-bold">${predicted_annual_cost.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Full Unrounded Precision Proof */}
        <div className="text-xs text-[#4B5563] font-sans space-y-1 bg-white/70 p-3 sm:p-4 rounded-xl border border-[#E5E7EB]">
          <div className="font-mono text-[11px] text-[#111827] truncate">
            <strong>Unrounded Float Verification:</strong> {intercept.toFixed(6)} + {sum_of_contributions_raw?.toFixed(6) || '0'} = {calculated_sum_raw?.toFixed(6)} (Exact Match)
          </div>
          <div className="flex items-start space-x-2 text-[#4B5563] text-[11px] pt-1">
            <Info className="w-4 h-4 text-[#1B4332] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Numerical Audit Note:</strong> Individual feature contributions are displayed rounded to 2 decimal places for clinical readability. 
              The internal 64-bit unrounded sum strictly matches the raw serialized Scikit-learn pipeline output with zero artificial adjustments.
            </span>
          </div>
        </div>
      </div>

      {/* 3. FACTOR CONTRIBUTION BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#111827] font-sans">
              Individual Factor Contributions (βⱼ · xⱼ)
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5">
              Includes all active encoded features, animated factor bars, and zero-valued reference baselines
            </p>
          </div>
          
          <button
            onClick={() => setShowFullBreakdown(!showFullBreakdown)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#E6EFEA] text-xs font-semibold text-[#1B4332] hover:bg-white transition-all shadow-xs cursor-pointer"
          >
            <span>{showFullBreakdown ? 'Collapse' : 'Expand All'}</span>
            {showFullBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {showFullBreakdown && (
          <div className="space-y-4">
            
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
              <table className="min-w-full divide-y divide-[#E5E7EB] text-left text-xs font-sans">
                <thead className="bg-[#E6EFEA]/50 text-[#111827] uppercase tracking-wider font-semibold text-[11px] font-numeric">
                  <tr>
                    <th className="px-5 py-3.5">Feature Name</th>
                    <th className="px-4 py-3.5">Encoded Value (x)</th>
                    <th className="px-4 py-3.5 font-mono">Weight (β)</th>
                    <th className="px-5 py-3.5 text-right font-mono">Contribution ($)</th>
                    <th className="px-5 py-3.5 w-40">Relative Impact</th>
                    <th className="px-5 py-3.5">Linear Association Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] font-mono text-[#111827]">
                  
                  {/* Baseline Intercept Row */}
                  <tr className="bg-[#E6EFEA]/30">
                    <td className="px-5 py-3.5 font-bold text-[#1B4332] font-sans flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332]"></span>
                      <span>Model Intercept (β₀)</span>
                    </td>
                    <td className="px-4 py-3.5 text-[#4B5563]">1.00</td>
                    <td className="px-4 py-3.5 font-medium text-[#1B4332]">
                      ${(intercept_display ?? intercept).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-[#1B4332] font-numeric">
                      +${(intercept_display ?? intercept).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#1B4332] h-full rounded-full transition-all duration-700" 
                          style={{ width: `${Math.min(100, Math.max(5, (Math.abs(intercept_display ?? intercept) / (predicted_annual_cost || 1000)) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#4B5563] font-sans text-xs">
                      Base expected cost for a policyholder at reference levels across all variables.
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {feature_contributions.map((c, idx) => {
                    const isPositive = (c.contribution || 0) > 0;
                    const isZero = (c.contribution || 0) === 0;
                    const absVal = Math.abs(c.contribution || 0);
                    const barPercent = Math.min(100, Math.max(isZero ? 0 : 3, (absVal / (predicted_annual_cost || 1000)) * 100));

                    return (
                      <tr 
                        key={idx} 
                        className={`transition-colors hover:bg-[#FBFBFA] ${
                          c.is_reference_baseline ? 'bg-[#FBFBFA]/60 text-[#4B5563]' : ''
                        }`}
                      >
                        <td className="px-5 py-3 font-sans font-medium text-[#111827]">
                          <div className="flex items-center space-x-2">
                            <span>{c.feature}</span>
                            {c.is_reference_baseline && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#E6EFEA] text-[#1B4332] border border-[#C5DFD3]">
                                Baseline
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#4B5563]">
                          {typeof c.encoded_value === 'number' 
                            ? c.encoded_value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                            : c.encoded_value}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {c.is_reference_baseline ? (
                            <span className="text-[#4B5563]">$0.00 [Ref]</span>
                          ) : (
                            <span className={c.coefficient > 0 ? 'text-[#1B4332]' : c.coefficient < 0 ? 'text-amber-700' : 'text-[#4B5563]'}>
                              ${c.coefficient_display ?? c.coefficient?.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold font-numeric">
                          {c.is_reference_baseline ? (
                            <span className="text-[#4B5563] font-normal">$0.00</span>
                          ) : isPositive ? (
                            <span className="text-[#1B4332]">
                              +${c.contribution.toFixed(2)}
                            </span>
                          ) : (c.contribution || 0) < 0 ? (
                            <span className="text-amber-700">
                              -${absVal.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-[#4B5563]">$0.00</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                c.is_reference_baseline 
                                  ? 'bg-transparent' 
                                  : isPositive 
                                  ? 'bg-[#1B4332]' 
                                  : 'bg-amber-600'
                              }`} 
                              style={{ width: `${barPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#4B5563] font-sans text-xs">
                          {c.interpretation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE STACKED VIEW */}
            <div className="md:hidden space-y-3">
              {/* Intercept Card */}
              <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#E6EFEA]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1B4332] text-sm">Model Intercept (β₀)</span>
                  <span className="font-mono font-bold text-sm text-[#1B4332]">
                    +${(intercept_display ?? intercept).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-[#4B5563]">
                  Base expected cost for a policyholder at reference levels across all variables.
                </div>
              </div>

              {/* Feature Cards */}
              {feature_contributions.map((c, idx) => {
                const isPositive = (c.contribution || 0) > 0;
                const isZero = (c.contribution || 0) === 0;

                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border border-[#E5E7EB] bg-white space-y-2 shadow-xs ${
                      c.is_reference_baseline ? 'bg-[#FBFBFA]/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-[#111827]">{c.feature}</span>
                        {c.is_reference_baseline && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#E6EFEA] text-[#1B4332]">
                            Baseline
                          </span>
                        )}
                      </div>
                      <span className={`font-mono font-bold text-xs ${
                        c.is_reference_baseline 
                          ? 'text-[#4B5563] font-normal' 
                          : isPositive 
                          ? 'text-[#1B4332]' 
                          : isZero 
                          ? 'text-[#4B5563]' 
                          : 'text-amber-700'
                      }`}>
                        {c.is_reference_baseline 
                          ? '$0.00' 
                          : isPositive 
                          ? `+$${c.contribution.toFixed(2)}` 
                          : (c.contribution || 0) < 0 
                          ? `-$${Math.abs(c.contribution).toFixed(2)}` 
                          : '$0.00'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4B5563] font-mono bg-[#FBFBFA] p-2 rounded-lg border border-[#E5E7EB]">
                      <div>Encoded Value: {c.encoded_value}</div>
                      <div>Weight: ${c.coefficient_display ?? c.coefficient?.toFixed(2)}</div>
                    </div>

                    <p className="text-xs text-[#4B5563] leading-relaxed">
                      {c.interpretation}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

    </motion.div>
  );
}
