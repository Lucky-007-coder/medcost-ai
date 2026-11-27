import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  GitCompare, CheckSquare, Square, FileDown, 
  AlertCircle, ArrowRight, TrendingUp, TrendingDown, Info, Search, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
} from 'recharts';
import { getHistory, downloadPredictionPdf } from '../../services/api';

const FEATURE_METADATA = [
  { key: 'age', label: 'Age', unit: 'yrs' },
  { key: 'sex', label: 'Biological Sex' },
  { key: 'bmi', label: 'Body Mass Index (BMI)', unit: 'kg/m²' },
  { key: 'dependents', label: 'Dependents' },
  { key: 'smoker', label: 'Smoking Status' },
  { key: 'region', label: 'Geographic Region' },
  { key: 'income', label: 'Annual Income', prefix: '$' },
  { key: 'systolic_bp', label: 'Systolic Blood Pressure', unit: 'mmHg' },
  { key: 'hba1c', label: 'HbA1c Level', unit: '%' },
  { key: 'visits_last_year', label: 'Doctor Visits (Past Year)' },
  { key: 'hospitalizations_last_3yrs', label: 'Inpatient Hospitalizations (3y)' },
  { key: 'chronic_count', label: 'Chronic Conditions Count' },
  { key: 'plan_type', label: 'Insurance Plan Type' },
  { key: 'deductible', label: 'Annual Deductible', prefix: '$' }
];

const CARD_COLORS = ['#1B4332', '#2D6A4F', '#52B788', '#C9A66B'];

export default function ComparisonView({ onNavigateToEstimator }) {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  // Fetch past predictions
  const fetchRecords = () => {
    setIsLoading(true);
    getHistory({ limit: 50 })
      .then(data => {
        if (data && data.records) {
          setHistoryRecords(data.records);
          // By default, auto-select the latest 2 records if available
          if (data.records.length >= 2 && selectedRecordIds.length === 0) {
            setSelectedRecordIds([data.records[0].id, data.records[1].id]);
          } else if (data.records.length === 1 && selectedRecordIds.length === 0) {
            setSelectedRecordIds([data.records[0].id]);
          }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filter records in the selector list
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return historyRecords;
    const q = searchQuery.toLowerCase().trim();
    return historyRecords.filter(r => {
      const p = r.input_parameters || {};
      return (
        String(r.id).includes(q) ||
        r.model_type?.toLowerCase().includes(q) ||
        p.smoker?.toLowerCase().includes(q) ||
        p.region?.toLowerCase().includes(q) ||
        String(p.age).includes(q)
      );
    });
  }, [historyRecords, searchQuery]);

  // Handle Checkbox Selection (Max 4 records)
  const toggleRecordSelection = (id) => {
    setSelectedRecordIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 records simultaneously.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Selected records objects
  const selectedRecords = useMemo(() => {
    return selectedRecordIds
      .map(id => historyRecords.find(r => r.id === id))
      .filter(Boolean);
  }, [selectedRecordIds, historyRecords]);

  // Handle PDF Download
  const handleDownloadPdf = async (id) => {
    setDownloadingId(id);
    try {
      await downloadPredictionPdf(id);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Bar Chart Data
  const chartData = useMemo(() => {
    return selectedRecords.map((r, idx) => ({
      name: `#${r.id} (${r.model_type === 'model_a' ? 'Core 6' : 'Clinical 14'})`,
      cost: r.predicted_cost,
      fill: CARD_COLORS[idx % CARD_COLORS.length]
    }));
  }, [selectedRecords]);

  // Baseline Reference Cost
  const baselineCost = selectedRecords[0]?.predicted_cost ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-sans">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-numeric font-semibold text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider">
            <GitCompare className="w-4 h-4" />
            <span>Multi-Profile Variance Audit</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-1">
            Prediction Comparison
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] max-w-2xl mt-1">
            Select 2 to 4 saved historical predictions from your SQLite audit trail to compare covariate inputs, linear attributions, and resulting estimated medical expenditures side-by-side.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          className="px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#0F1412] border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] hover:border-[#1B4332] transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788] ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* 2. RECORD SELECTOR STRIP */}
      <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#111827] dark:text-[#FFFFFF]">
              Select Records to Compare:
            </span>
            <span className="text-xs font-numeric font-bold px-2 py-0.5 rounded-full bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
              {selectedRecordIds.length} of {Math.min(4, historyRecords.length)} selected (Max 4)
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="Search by ID, smoker, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] bg-white dark:bg-[#080B09] text-[#111827] dark:text-[#FFFFFF] focus:ring-1 focus:ring-[#1B4332] dark:focus:ring-[#52B788]"
            />
          </div>
        </div>

        {/* Scrollable Selector Pills */}
        <div className="overflow-x-auto pb-1">
          {historyRecords.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#4B5563] dark:text-[#9CA3AF]">
              No historical records in SQLite. Run predictions in the Cost Estimator first.
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-max">
              {filteredRecords.map((r) => {
                const isSelected = selectedRecordIds.includes(r.id);
                const p = r.input_parameters || {};
                return (
                  <div
                    key={r.id}
                    onClick={() => toggleRecordSelection(r.id)}
                    className={`px-3.5 py-2 rounded-2xl border transition-all cursor-pointer flex items-center space-x-2.5 ${
                      isSelected
                        ? 'bg-[#E6EFEA] dark:bg-[#080B09] border-[#1B4332] dark:border-[#52B788] shadow-xs'
                        : 'bg-[#FBFBFA] dark:bg-[#000000] border-[#E5E7EB] dark:border-[#1F2622] hover:border-[#1B4332]/40 text-[#4B5563] dark:text-[#9CA3AF]'
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[11px] font-bold text-[#111827] dark:text-[#FFFFFF]">#{r.id}</span>
                        <span className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">Age {p.age}, {p.smoker}</span>
                      </div>
                      <span className="text-xs font-numeric font-bold text-[#1B4332] dark:text-[#52B788]">
                        ${r.predicted_cost?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. COMPARISON CARDS OR EMPTY STATE */}
      {selectedRecords.length < 2 ? (
        <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-dashed border-[#E5E7EB] dark:border-[#1F2622] p-12 text-center space-y-3 shadow-xs">
          <GitCompare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#111827] dark:text-[#FFFFFF]">
            Select At Least 2 Predictions
          </h3>
          <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] max-w-md mx-auto">
            Choose two or more prediction audit records from the selector strip above to initiate a comprehensive multi-variable variance comparison.
          </p>
          {historyRecords.length >= 2 && (
            <button
              onClick={() => setSelectedRecordIds([historyRecords[0].id, historyRecords[1].id])}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] hover:bg-[#2D6A4F] cursor-pointer"
            >
              Compare Latest 2 Predictions
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Side-by-Side Profile Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedRecords.map((r, idx) => {
              const diffVsBase = r.predicted_cost - baselineCost;
              const pctVsBase = baselineCost > 0 ? (diffVsBase / baselineCost) * 100 : 0;
              const isBaseline = idx === 0;
              const p = r.input_parameters || {};

              return (
                <div 
                  key={r.id}
                  className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2 py-0.5 rounded-md">
                        #{r.id} {isBaseline && '• Reference Baseline'}
                      </span>
                      <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase font-mono">
                        {r.model_type?.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">Predicted Cost</p>
                      <div className="font-serif text-2xl sm:text-3xl font-bold text-[#111827] dark:text-[#FFFFFF] mt-0.5">
                        ${r.predicted_cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Variance vs Baseline */}
                    {!isBaseline && (
                      <div className="flex items-center space-x-1.5 text-xs">
                        <span className={`font-semibold ${diffVsBase > 0 ? 'text-[#D98C72] dark:text-[#E29578]' : 'text-[#2D6A4F] dark:text-[#52B788]'}`}>
                          {diffVsBase >= 0 ? `+$${diffVsBase.toFixed(2)}` : `-$${Math.abs(diffVsBase).toFixed(2)}`}
                        </span>
                        <span className={`text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                          diffVsBase > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {pctVsBase >= 0 ? `+${pctVsBase.toFixed(1)}%` : `${pctVsBase.toFixed(1)}%`}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-[#4B5563] dark:text-[#9CA3AF] space-y-1 pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622]">
                      <div className="flex justify-between">
                        <span>Demographics:</span>
                        <span className="font-medium text-[#111827] dark:text-[#FFFFFF]">{p.age} yrs, {p.sex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Smoking:</span>
                        <span className="font-medium text-[#111827] dark:text-[#FFFFFF]">{p.smoker}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chronic:</span>
                        <span className="font-medium text-[#111827] dark:text-[#FFFFFF]">{p.chronic_count ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#1F2622]">
                    <button
                      onClick={() => handleDownloadPdf(r.id)}
                      disabled={downloadingId === r.id}
                      className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-[#080B09] hover:bg-[#E6EFEA] dark:hover:bg-[#112D22] text-[#111827] dark:text-[#FFFFFF] border border-[#E5E7EB] dark:border-[#1F2622] transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#1B4332] dark:text-[#52B788]" />
                      <span>{downloadingId === r.id ? 'Generating...' : 'Download PDF'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparative Cost Bar Chart */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#111827] dark:text-[#FFFFFF] mb-1">
              Annual Medical Expenditure Comparison
            </h3>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-4">
              Estimated mean annual expenditure for each selected profile under OLS Linear Regression.
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={11} 
                    tickFormatter={(v) => `$${v.toLocaleString()}`} 
                  />
                  <Tooltip 
                    formatter={(val) => [`$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })} / yr`, 'Predicted Cost']}
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      borderColor: '#E5E7EB', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                    }}
                  />
                  <Bar dataKey="cost" radius={[8, 8, 0, 0]} barSize={44}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Difference Matrix Table */}
          <div className="bg-white dark:bg-[#0F1412] rounded-3xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#111827] dark:text-[#FFFFFF] mb-1">
              Covariate Profile & Divergence Matrix
            </h3>
            <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] mb-4">
              Rows highlighted in green denote input traits that differ across the selected profiles.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#E6EFEA]/40 dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] uppercase tracking-wider font-numeric border-b border-[#E5E7EB] dark:border-[#1F2622]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Covariate Trait</th>
                    {selectedRecords.map((r, idx) => (
                      <th key={r.id} className="py-2.5 px-4 font-semibold">
                        Profile #{r.id} {idx === 0 && '(Baseline)'}
                      </th>
                    ))}
                    <th className="py-2.5 px-4 font-semibold text-right">Trait Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2622]">
                  {FEATURE_METADATA.map(field => {
                    const values = selectedRecords.map(r => (r.input_parameters || {})[field.key]);
                    // Check if all defined values are equal
                    const uniqueVals = new Set(values.map(v => v !== undefined ? String(v) : 'N/A'));
                    const isDifferent = uniqueVals.size > 1;

                    return (
                      <tr 
                        key={field.key} 
                        className={`transition-colors ${
                          isDifferent 
                            ? 'bg-[#E6EFEA]/20 dark:bg-[#080B09]/40 font-medium' 
                            : 'hover:bg-gray-50 dark:hover:bg-[#121714]/20'
                        }`}
                      >
                        <td className="py-2.5 px-4 text-[#111827] dark:text-[#FFFFFF]">
                          {field.label}
                        </td>

                        {selectedRecords.map(r => {
                          const val = (r.input_parameters || {})[field.key];
                          let displayStr = 'N/A';
                          if (val !== undefined && val !== null) {
                            if (field.prefix) displayStr = `${field.prefix}${Number(val).toLocaleString()}`;
                            else if (field.unit) displayStr = `${val} ${field.unit}`;
                            else displayStr = String(val);
                          }
                          return (
                            <td key={r.id} className="py-2.5 px-4 font-mono text-[#111827] dark:text-[#FFFFFF]">
                              {displayStr}
                            </td>
                          );
                        })}

                        <td className="py-2.5 px-4 text-right">
                          {isDifferent ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border border-[#CBE0D4] dark:border-[#1F2622]">
                              Differs
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
                              Identical
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. METHODOLOGY DISCLAIMER */}
          <div className="bg-[#FBFBFA] dark:bg-[#080B09]/70 border border-[#E5E7EB] dark:border-[#1F2622] rounded-2xl p-4 text-xs text-[#4B5563] dark:text-[#9CA3AF] flex items-start space-x-3">
            <Info className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Attribution & Multi-Variable Policy Note:</b> The observed differences between predictions are produced by multivariate Ordinary Least Squares (OLS) closed-form regression. Because health economics data involves correlated risk attributes, differences between distinct profiles should not be interpreted as single-variable causal effects.
            </p>
          </div>
        </>
      )}

    </div>
  );
}
