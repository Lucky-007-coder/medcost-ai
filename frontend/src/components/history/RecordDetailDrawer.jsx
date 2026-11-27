import React, { useState } from 'react';
import { 
  X, ShieldCheck, Database, Calendar, Tag, Activity, 
  Trash2, Layers, Calculator, CheckCircle2, User, Stethoscope, FileText, FileDown 
} from 'lucide-react';
import { downloadPredictionPdf } from '../../services/api';

export default function RecordDetailDrawer({
  isOpen,
  record,
  onClose,
  onDeleteRequest
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  if (!isOpen || !record) return null;

  const handleDownloadPdf = async (id) => {
    setIsDownloading(true);
    try {
      await downloadPredictionPdf(id);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const params = record.input_parameters || {};
  const isModelB = record.model_type === 'model_b';
  const contribs = record.feature_contributions || [];
  const evalMetrics = record.evaluation_metrics || {};
  const intercept = record.intercept !== undefined ? record.intercept : null;

  // Format timestamp
  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  // Compute sum of contributions if available
  const sumOfContribs = contribs.reduce((acc, c) => acc + (c.contribution || 0), 0);
  const totalVerifiedSum = intercept !== null ? intercept + sumOfContribs : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 font-sans">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full sm:max-w-xl md:max-w-2xl bg-[#FBFBFA] dark:bg-[#000000] border-l border-[#E5E7EB] dark:border-[#1F2622] h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#0F1412] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-numeric text-xs font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2.5 py-0.5 rounded-md border border-[#C5DFD3] dark:border-[#1F2622]">
                Audit Record #{record.id}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                isModelB 
                  ? 'bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border-[#C5DFD3] dark:border-[#1F2622]' 
                  : 'bg-[#FBFBFA] dark:bg-[#080B09] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622]'
              }`}>
                {isModelB ? 'Model B (Clinical Intake)' : 'Model A (Core Basic)'}
              </span>
            </div>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] font-mono flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span>{formatDate(record.timestamp)}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] hover:bg-[#E6EFEA] dark:hover:bg-[#161D19] transition-colors cursor-pointer"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-6 text-[#111827] dark:text-[#FFFFFF] text-xs">
          
          {/* Stored Immutable Audit Notice */}
          <div className="p-3.5 bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl flex items-start gap-3 text-xs text-[#4B5563] dark:text-[#9CA3AF] shadow-sm">
            <Database className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="text-[#111827] dark:text-[#FFFFFF] block font-semibold">Immutable SQLite Audit Record</strong>
              <span>
                Values reflect exact historical inputs and serialized OLS pipeline decomposition recorded at inference time.
              </span>
            </div>
          </div>

          {/* Large Predicted Cost Card */}
          <div className="bg-[#1B4332] dark:bg-[#080B09] text-white rounded-2xl p-6 sm:p-7 shadow-sm space-y-2 relative overflow-hidden border border-[#2D6A4F] dark:border-[#1F2622]">
            <div className="absolute right-0 top-0 w-48 h-48 bg-[#52B788]/15 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#E6EFEA] dark:text-[#52B788] block font-medium">
              Estimated Annual Medical Cost
            </span>
            <div className="font-numeric text-3xl sm:text-4xl font-bold tracking-tight text-white">
              ${record.predicted_cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-[#E6EFEA]/90 dark:text-[#9CA3AF] flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-[#52B788]" />
              <span>Verified Ordinary Least Squares (OLS) Closed-Form Linear Solution</span>
            </div>
          </div>

          {/* Patient Inputs Grid */}
          <div className="space-y-3 bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-sm">
            <div className="flex items-center gap-2 font-serif font-bold text-base text-[#1B4332] dark:text-[#52B788]">
              <User className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
              <h4>Recorded Patient Input Parameters</h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
                <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Age</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">{params.age ?? 'N/A'} yrs</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
                <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Sex</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">{params.sex ?? 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
                <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">BMI</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">{params.bmi ?? 'N/A'} kg/m²</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
                <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Dependents</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">{params.dependents ?? 'N/A'}</span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
                <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Smoking Status</span>
                <span className={`font-numeric text-base font-bold ${params.smoker === 'Current' ? 'text-[#D98C72] dark:text-rose-400' : 'text-[#111827] dark:text-[#FFFFFF]'}`}>
                  {params.smoker ?? 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
                <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Region</span>
                <span className="font-numeric text-base font-bold text-[#111827] dark:text-[#FFFFFF]">{params.region ?? 'N/A'}</span>
              </div>

              {/* Model B specific clinical fields */}
              {isModelB && (
                <>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Plan Type</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">{params.plan_type ?? 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Annual Income</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">
                      ${params.income?.toLocaleString() ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Systolic BP</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">{params.systolic_bp ?? 'N/A'} mmHg</span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">HbA1c</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">{params.hba1c ?? 'N/A'}%</span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Doctor Visits (1y)</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">{params.visits_last_year ?? 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Hospitalizations (3y)</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">{params.hospitalizations_last_3yrs ?? 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Chronic Count</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">{params.chronic_count ?? 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-[#E6EFEA]/40 dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] rounded-xl">
                    <span className="text-[10px] text-[#1B4332] dark:text-[#52B788] uppercase block font-mono font-medium">Deductible</span>
                    <span className="font-numeric text-base font-bold text-[#1B4332] dark:text-[#52B788]">${params.deductible?.toLocaleString() ?? 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mathematical Decomposition Breakdown */}
          {contribs.length > 0 && (
            <div className="space-y-3 bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif font-bold text-base text-[#1B4332] dark:text-[#52B788]">
                  <Calculator className="w-4 h-4 text-[#1B4332] dark:text-[#52B788]" />
                  <h4>Mathematical Decomposition (β · x)</h4>
                </div>
                <span className="font-numeric text-xs font-bold text-[#4B5563] dark:text-[#9CA3AF]">
                  Intercept: ${intercept?.toFixed(2) ?? 'N/A'}
                </span>
              </div>

              <div className="border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#E6EFEA]/60 dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] font-semibold border-b border-[#E5E7EB] dark:border-[#1F2622]">
                    <tr>
                      <th className="py-2.5 px-3">Regressor</th>
                      <th className="py-2.5 px-3 text-right">Encoded Value</th>
                      <th className="py-2.5 px-3 text-right">Weight (β)</th>
                      <th className="py-2.5 px-3 text-right">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2622] font-numeric text-xs">
                    {/* Intercept row */}
                    <tr className="bg-[#E6EFEA]/30 dark:bg-[#080B09]/40">
                      <td className="py-2.5 px-3 font-semibold text-[#1B4332] dark:text-[#52B788] font-sans">
                        β₀ Intercept Baseline
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#4B5563] dark:text-[#9CA3AF]">1.0</td>
                      <td className="py-2.5 px-3 text-right text-[#1B4332] dark:text-[#52B788] font-medium">${intercept?.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#1B4332] dark:text-[#52B788]">${intercept?.toFixed(2)}</td>
                    </tr>

                    {/* Feature contribution rows */}
                    {contribs.map((c, i) => (
                      <tr key={i} className={c.is_reference_baseline ? 'text-[#9CA3AF] dark:text-[#6B7280] bg-[#FBFBFA] dark:bg-[#080B09]/30' : 'text-[#111827] dark:text-[#FFFFFF]'}>
                        <td className="py-2 px-3 font-sans font-medium">
                          {c.feature}
                          {c.is_reference_baseline && (
                            <span className="ml-1 text-[10px] text-[#9CA3AF] italic font-normal">[Reference]</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-[#4B5563] dark:text-[#9CA3AF]">
                          {typeof c.encoded_value === 'number' ? c.encoded_value.toLocaleString() : c.encoded_value}
                        </td>
                        <td className="py-2 px-3 text-right text-[#4B5563] dark:text-[#9CA3AF]">
                          {c.coefficient !== undefined ? `$${c.coefficient.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold ${
                          c.contribution > 0 ? 'text-[#1B4332] dark:text-[#52B788]' : c.contribution < 0 ? 'text-[#D98C72] dark:text-rose-400' : 'text-[#9CA3AF]'
                        }`}>
                          {c.contribution >= 0 ? '+' : ''}${c.contribution?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Total verification footer */}
                  <tfoot className="bg-[#E6EFEA]/60 dark:bg-[#080B09] font-numeric font-bold text-xs border-t border-[#E5E7EB] dark:border-[#1F2622]">
                    <tr>
                      <td colSpan="3" className="py-3 px-3 text-[#111827] dark:text-[#FFFFFF] font-sans">
                        Calculated Linear Sum (Intercept + Contributions)
                      </td>
                      <td className="py-3 px-3 text-right text-[#1B4332] dark:text-[#52B788] text-sm">
                        ${totalVerifiedSum?.toFixed(2) ?? record.predicted_cost?.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Stored Model Evaluation Metrics Snapshot */}
          {evalMetrics && evalMetrics.r2_score !== undefined && (
            <div className="space-y-2.5 pt-2 bg-white dark:bg-[#0F1412] p-5 rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-sm">
              <span className="text-xs font-semibold text-[#111827] dark:text-[#FFFFFF] block">
                Model Evaluation Snapshot (at inference time)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] block font-mono">Test R²</span>
                  <span className="font-numeric text-sm font-bold text-[#111827] dark:text-[#FFFFFF]">
                    {(evalMetrics.r2_score * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="p-2.5 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] block font-mono">Adj R²</span>
                  <span className="font-numeric text-sm font-bold text-[#111827] dark:text-[#FFFFFF]">
                    {(evalMetrics.adjusted_r2 * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="p-2.5 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] block font-mono">Test MAE</span>
                  <span className="font-numeric text-sm font-bold text-[#111827] dark:text-[#FFFFFF]">
                    ${evalMetrics.mae?.toFixed(0)}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622]">
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] block font-mono">Test RMSE</span>
                  <span className="font-numeric text-sm font-bold text-[#111827] dark:text-[#FFFFFF]">
                    ${evalMetrics.rmse?.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#0F1412] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onDeleteRequest(record)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-[#8B4B32] dark:text-rose-400 bg-[#F2D8C9]/40 dark:bg-rose-950/40 hover:bg-[#F2D8C9]/70 dark:hover:bg-rose-900/60 border border-[#F2D8C9] dark:border-rose-900/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf(record.id)}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-white bg-[#1B4332] dark:bg-[#52B788] hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] dark:text-[#000000] rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#E6EFEA] dark:bg-[#161D19] hover:bg-[#C5DFD3] dark:hover:bg-[#1F2622] text-[#1B4332] dark:text-[#FFFFFF] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
