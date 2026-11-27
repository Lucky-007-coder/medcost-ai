import React, { useState, useEffect } from 'react';
import { 
  X, User, ShieldCheck, Settings, Info, FileDown, 
  Database, Activity, CheckCircle2, Lock, ExternalLink, GraduationCap 
} from 'lucide-react';
import { getHistory, downloadPredictionPdf } from '../../services/api';
import { useUser } from '../../context/UserContext';

export function ProfileModal({ isOpen, onClose }) {
  const { user } = useUser();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#000000] border border-[#E5E7EB] dark:border-[#1F2622] rounded-3xl p-6 shadow-2xl text-[#111827] dark:text-[#F1F5F2] font-sans space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="profile-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#1B4332] to-[#2D6A4F] text-[#52B788] ring-2 ring-[#52B788] flex items-center justify-center font-bold text-base tracking-wider shadow-sm">
                {user?.initials || 'LG'}
              </div>
            </div>
            <div>
              <h3 id="profile-title" className="font-bold text-base text-[#111827] dark:text-[#FFFFFF]">{user?.name || 'Lucky Gupta'}</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-mono">{user?.role || 'BTech 2nd Year'} • Health Analytics</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#F1F5F2] hover:bg-[#F4F5F0] dark:hover:bg-[#121714] transition-colors cursor-pointer"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl space-y-1">
            <span className="text-[10px] text-[#6B7280] dark:text-[#A8B5AC] uppercase font-mono block">Academic Designation</span>
            <p className="font-medium text-[#111827] dark:text-[#F1F5F2] flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#52B788]" />
              <span>BTech Undergraduate (2nd Year) — Healthcare Predictive Modeling</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
              <span className="text-[10px] text-[#6B7280] dark:text-[#A8B5AC] uppercase font-mono block">Network Status</span>
              <p className="font-bold text-[#52B788] flex items-center gap-1.5 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                <span>Online & Synchronized</span>
              </p>
            </div>
            <div className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl">
              <span className="text-[10px] text-[#6B7280] dark:text-[#A8B5AC] uppercase font-mono block">Analytical Privilege</span>
              <p className="font-bold text-[#111827] dark:text-[#FFFFFF] pt-0.5">Full OLS Execution</p>
            </div>
          </div>

          <div className="p-3.5 bg-[#E6EFEA]/60 dark:bg-[#0A0D0B] border border-[#CBE0D4] dark:border-[#1F2622] rounded-xl text-[11px] text-[#4B5563] dark:text-[#A8B5AC] leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#52B788] flex-shrink-0 mt-0.5" />
            <span>
              <strong>Local Session:</strong> All predictions, What-If explorations, and SQLite audit records persist directly to your local database without external cloud exposure.
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6EFEA] dark:bg-[#121714] hover:bg-[#C5DFD3] dark:hover:bg-[#1A221D] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#000000] border border-[#E5E7EB] dark:border-[#1F2622] rounded-3xl p-6 shadow-2xl text-[#111827] dark:text-[#F1F5F2] font-sans space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="settings-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-[#52B788]" />
            <h3 id="settings-title" className="font-bold text-base text-[#111827] dark:text-[#FFFFFF]">Platform Configuration</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#F1F5F2] hover:bg-[#F4F5F0] dark:hover:bg-[#121714] transition-colors cursor-pointer"
            aria-label="Close settings modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl flex items-center justify-between">
            <div>
              <strong className="block text-[#111827] dark:text-[#FFFFFF] font-semibold">Prediction Algorithm</strong>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Ordinary Least Squares (OLS) Linear Regression</span>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E6EFEA] dark:bg-[#121714] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              Active
            </span>
          </div>

          <div className="p-3.5 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl flex items-center justify-between">
            <div>
              <strong className="block text-[#111827] dark:text-[#FFFFFF] font-semibold">Dual Models</strong>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Model A (Demographics) & Model B (Clinical Intake)</span>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E6EFEA] dark:bg-[#121714] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              Loaded
            </span>
          </div>

          <div className="p-3.5 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl flex items-center justify-between">
            <div>
              <strong className="block text-[#111827] dark:text-[#FFFFFF] font-semibold">SQLite Audit Ledger</strong>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Local ACID database (backend/database/predictions.db)</span>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E6EFEA] dark:bg-[#121714] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              Connected
            </span>
          </div>

          <div className="p-3.5 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl flex items-center justify-between">
            <div>
              <strong className="block text-[#111827] dark:text-[#FFFFFF] font-semibold">Mathematical Tolerance</strong>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Unrounded attribution verification</span>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-[#E6EFEA] dark:bg-[#121714] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              ≤ 10⁻⁶
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6EFEA] dark:bg-[#121714] hover:bg-[#C5DFD3] dark:hover:bg-[#1A221D] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622] transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#000000] border border-[#E5E7EB] dark:border-[#1F2622] rounded-3xl p-6 shadow-2xl text-[#111827] dark:text-[#F1F5F2] font-sans space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="about-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
          <div className="flex items-center space-x-2.5">
            <Info className="w-5 h-5 text-[#52B788]" />
            <h3 id="about-title" className="font-bold text-base text-[#111827] dark:text-[#FFFFFF]">About MedCost.ai</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#F1F5F2] hover:bg-[#F4F5F0] dark:hover:bg-[#121714] transition-colors cursor-pointer"
            aria-label="Close about modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
          <p>
            <strong className="text-[#111827] dark:text-[#FFFFFF]">MedCost.ai</strong> is an editorial healthcare analytics and actuarial cost prediction platform developed by <strong>Lucky Gupta (BTech 2nd Year)</strong>.
          </p>
          <div className="p-3.5 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl space-y-1.5 text-xs text-[#111827] dark:text-[#F1F5F2]">
            <strong className="text-[#1B4332] dark:text-[#52B788] block font-mono uppercase text-[11px]">Academic & Methodological Standards</strong>
            <ul className="list-disc list-inside space-y-1 text-[#4B5563] dark:text-[#9CA3AF]">
              <li>Pure Ordinary Least Squares (OLS) Linear Regression — strictly interpretable.</li>
              <li>100,000 synthetic patient records evaluated under 80/20 train/test partition.</li>
              <li>Clinical Model B Holdout R²: <strong>16.90%</strong>, MAE: <strong>$1,778.62</strong>.</li>
              <li>Exact mathematical attribution decomposition verified to machine precision ($\le 10^{-6}$).</li>
            </ul>
          </div>
          <p className="text-[11px] text-[#6B7280] dark:text-[#A8B5AC]/80">
            Engineered for healthcare researchers, actuarial students, and clinicians to explain medical cost determinants before policy issuance.
          </p>
        </div>

        <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6EFEA] dark:bg-[#121714] hover:bg-[#C5DFD3] dark:hover:bg-[#1A221D] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function DownloadReportsModal({ isOpen, onClose, onNavigateToHistory }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getHistory({ limit: 4 })
        .then((data) => {
          setPredictions(data.predictions || []);
        })
        .catch((err) => {
          console.error('Failed to load predictions:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleDownload = async (id) => {
    setDownloadingId(id);
    try {
      await downloadPredictionPdf(id);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#000000] border border-[#E5E7EB] dark:border-[#1F2622] rounded-3xl p-6 shadow-2xl text-[#111827] dark:text-[#F1F5F2] font-sans space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="reports-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#1F2622]">
          <div className="flex items-center space-x-2.5">
            <FileDown className="w-5 h-5 text-[#52B788]" />
            <h3 id="reports-title" className="font-bold text-base text-[#111827] dark:text-[#FFFFFF]">Download Actuarial PDF Reports</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-[#6B7280] dark:text-[#A8B5AC] hover:text-[#111827] dark:hover:text-[#F1F5F2] hover:bg-[#F4F5F0] dark:hover:bg-[#121714] transition-colors cursor-pointer"
            aria-label="Close reports modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-[#4B5563] dark:text-[#9CA3AF] text-xs">
            Generate and download certified PDF actuarial reports containing unrounded OLS mathematical decompositions, patient intake matrices, and confidence intervals.
          </p>

          <div className="space-y-2">
            <span className="text-[10px] text-[#6B7280] dark:text-[#A8B5AC] uppercase font-mono block">Recent Audit Records</span>
            {loading ? (
              <div className="py-6 text-center text-[#6B7280] dark:text-[#A8B5AC] font-mono">Loading records...</div>
            ) : predictions.length === 0 ? (
              <div className="p-4 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl text-center text-[#6B7280] dark:text-[#A8B5AC]">
                No predictions recorded yet. Run a prediction in Cost Estimator first!
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {predictions.map((p) => (
                  <div 
                    key={p.id}
                    className="p-3 bg-[#F4F5F0] dark:bg-[#0A0D0B] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-numeric font-bold text-xs text-[#1B4332] dark:text-[#52B788]">Record #{p.id}</span>
                        <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] font-mono">
                          {p.model_type === 'model_b' ? 'Clinical' : 'Basic'}
                        </span>
                      </div>
                      <span className="font-numeric text-sm font-bold text-[#111827] dark:text-[#FFFFFF] block pt-0.5">
                        ${p.predicted_cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownload(p.id)}
                      disabled={downloadingId === p.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>{downloadingId === p.id ? 'Generating...' : 'PDF'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigateToHistory();
            }}
            className="text-xs text-[#1B4332] dark:text-[#52B788] hover:underline cursor-pointer font-medium"
          >
            View all in History →
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6EFEA] dark:bg-[#121714] hover:bg-[#C5DFD3] dark:hover:bg-[#1A221D] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
