import React from 'react';
import { Eye, Trash2, ChevronLeft, ChevronRight, FileSpreadsheet, ArrowRight } from 'lucide-react';

export default function HistoryTable({
  records,
  loading,
  totalRecords,
  page,
  setPage,
  limit,
  onViewRecord,
  onDeleteRequest,
  onNavigateToEstimator
}) {
  const totalPages = Math.ceil(totalRecords / limit) || 1;

  // Format timestamp helper
  const formatTime = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-[#FBFBFA] dark:bg-[#080B09] rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-12 text-center space-y-4 shadow-sm font-sans">
        <div className="w-14 h-14 rounded-2xl bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="font-serif text-2xl font-normal text-[#111827] dark:text-[#FFFFFF]">
            No Historical Records Found
          </h3>
          <p className="text-sm text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
            There are currently no prediction records matching your filter or search criteria.
          </p>
        </div>
        {onNavigateToEstimator && (
          <button
            onClick={onNavigateToEstimator}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] transition-all shadow-sm cursor-pointer"
          >
            <span>Launch Cost Estimator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Desktop Table View (>= 768px) */}
      <div className="hidden md:block bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E6EFEA]/60 dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] font-mono text-[11px] uppercase tracking-wider border-b border-[#E5E7EB] dark:border-[#1F2622]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Record ID</th>
                <th className="py-3.5 px-4">Audit Timestamp</th>
                <th className="py-3.5 px-4">Model Pipeline</th>
                <th className="py-3.5 px-3 text-right">Age</th>
                <th className="py-3.5 px-3">Sex</th>
                <th className="py-3.5 px-3 text-right">BMI</th>
                <th className="py-3.5 px-3">Smoking Status</th>
                <th className="py-3.5 px-4 text-right">Estimated Cost</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#1F2622] text-[#111827] dark:text-[#FFFFFF]">
              {records.map((record) => {
                const params = record.input_parameters || {};
                const isModelB = record.model_type === 'model_b';

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-[#FBFBFA] dark:hover:bg-[#121714] transition-colors group cursor-pointer"
                    onClick={() => onViewRecord(record)}
                  >
                    <td className="py-3.5 px-4 font-numeric font-bold text-[#1B4332] dark:text-[#52B788] text-sm">
                      #{record.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5563] dark:text-[#9CA3AF] font-mono text-[11px] whitespace-nowrap">
                      {formatTime(record.timestamp)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                        isModelB 
                          ? 'bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border-[#C5DFD3] dark:border-[#1F2622] font-semibold' 
                          : 'bg-[#FBFBFA] dark:bg-[#000000] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622]'
                      }`}>
                        {isModelB ? 'Model B Clinical' : 'Model A Basic'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-numeric font-medium text-[#111827] dark:text-[#FFFFFF] text-sm">
                      {params.age ?? 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-[#111827] dark:text-[#FFFFFF]">
                      {params.sex ?? 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-right font-numeric text-[#111827] dark:text-[#FFFFFF]">
                      {params.bmi ? Number(params.bmi).toFixed(1) : 'N/A'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        params.smoker === 'Current' 
                          ? 'bg-[#F2D8C9] dark:bg-rose-950/60 text-[#8B4B32] dark:text-rose-300 font-semibold' 
                          : params.smoker === 'Former' 
                          ? 'bg-[#F8F4EA] dark:bg-amber-950/60 text-[#8B6528] dark:text-amber-300 border border-[#C9A66B]/40 dark:border-amber-800/40' 
                          : 'bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788]'
                      }`}>
                        {params.smoker ?? 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-numeric font-bold text-base text-[#1B4332] dark:text-[#52B788]">
                      ${record.predicted_cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewRecord(record)}
                          className="p-1.5 text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#1B4332] dark:hover:text-[#52B788] hover:bg-[#E6EFEA] dark:hover:bg-[#121714] rounded-lg transition-colors cursor-pointer"
                          title="View exact breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRequest(record)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#D98C72] hover:bg-[#F2D8C9]/40 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Cards View (< 768px) */}
      <div className="md:hidden space-y-3">
        {records.map((record) => {
          const params = record.input_parameters || {};
          const isModelB = record.model_type === 'model_b';

          return (
            <div
              key={record.id}
              className="bg-white dark:bg-[#0F1412] rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] p-4 space-y-3 shadow-sm cursor-pointer"
              onClick={() => onViewRecord(record)}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#E5E7EB] dark:border-[#1F2622] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-numeric text-xs font-bold text-[#1B4332] dark:text-[#52B788] bg-[#E6EFEA] dark:bg-[#080B09] px-2 py-0.5 rounded border border-[#C5DFD3] dark:border-[#1F2622]">
                    #{record.id}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isModelB 
                      ? 'bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] border-[#C5DFD3] dark:border-[#1F2622]' 
                      : 'bg-[#FBFBFA] dark:bg-[#000000] text-[#4B5563] dark:text-[#9CA3AF] border-[#E5E7EB] dark:border-[#1F2622]'
                  }`}>
                    {isModelB ? 'Model B Clinical' : 'Model A Basic'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  {formatTime(record.timestamp)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Patient</span>
                  <span className="text-[#111827] dark:text-[#FFFFFF] font-medium">
                    {params.age} yrs • {params.sex} • BMI {params.bmi}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Smoker</span>
                  <span className={`font-semibold ${
                    params.smoker === 'Current' ? 'text-[#8B4B32] dark:text-rose-400' : 'text-[#111827] dark:text-[#FFFFFF]'
                  }`}>
                    {params.smoker}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[#E5E7EB] dark:border-[#1F2622]" onClick={(e) => e.stopPropagation()}>
                <div>
                  <span className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase block font-mono">Estimated Cost</span>
                  <span className="font-numeric text-lg font-bold text-[#1B4332] dark:text-[#52B788]">
                    ${record.predicted_cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewRecord(record)}
                    className="px-3 py-1.5 bg-[#E6EFEA] dark:bg-[#080B09] text-[#1B4332] dark:text-[#52B788] rounded-lg text-xs font-semibold hover:bg-[#C5DFD3] dark:hover:bg-[#161D19] transition-colors"
                  >
                    View Breakdown
                  </button>
                  <button
                    onClick={() => onDeleteRequest(record)}
                    className="p-1.5 text-[#D98C72] hover:bg-[#F2D8C9]/40 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#4B5563] dark:text-[#9CA3AF] shadow-sm">
        <div>
          Showing page <strong className="text-[#111827] dark:text-[#FFFFFF] font-numeric font-bold">{page}</strong> of <strong className="text-[#111827] dark:text-[#FFFFFF] font-numeric font-bold">{totalPages}</strong> ({totalRecords} records total)
        </div>

        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-[#1F2622] hover:bg-[#FBFBFA] dark:hover:bg-[#121714] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              if (totalPages > 5 && Math.abs(p - page) > 1 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return <span key={p} className="px-1 text-[#9CA3AF]">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg font-numeric text-xs font-bold transition-all cursor-pointer ${
                    page === p
                      ? 'bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] shadow-sm'
                      : 'text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#FBFBFA] dark:hover:bg-[#121714]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-[#E5E7EB] dark:border-[#1F2622] hover:bg-[#FBFBFA] dark:hover:bg-[#121714] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
