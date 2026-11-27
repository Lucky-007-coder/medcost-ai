import React, { useState, useEffect } from 'react';
import { Search, X, Download, ArrowUpDown } from 'lucide-react';

export default function HistoryFilterToolbar({
  modelFilter,
  setModelFilter,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onExportCSV,
  exporting,
  totalFiltered
}) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] p-4 sm:p-5 shadow-sm space-y-4 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Model Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#E6EFEA]/60 dark:bg-[#080B09] rounded-xl text-xs font-semibold self-start sm:self-auto overflow-x-auto max-w-full border border-[#C5DFD3]/60 dark:border-[#1F2622]">
          <button
            onClick={() => setModelFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              modelFilter === 'all'
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] shadow-sm font-semibold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            All Predictions
          </button>
          <button
            onClick={() => setModelFilter('model_a')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              modelFilter === 'model_a'
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] shadow-sm font-semibold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model A — Basic
          </button>
          <button
            onClick={() => setModelFilter('model_b')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              modelFilter === 'model_b'
                ? 'bg-white dark:bg-[#0F1412] text-[#1B4332] dark:text-[#52B788] shadow-sm font-semibold'
                : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF]'
            }`}
          >
            Model B — Clinical
          </button>
        </div>

        {/* Action Controls: Search, Sort, Export */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ID, age, smoker..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl focus:bg-white dark:focus:bg-[#0F1412] focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20 dark:focus:ring-[#52B788]/20 focus:border-[#1B4332] dark:focus:border-[#52B788] text-[#111827] dark:text-[#FFFFFF] transition-all placeholder:text-[#9CA3AF]"
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl px-3 py-2 text-xs text-[#111827] dark:text-[#FFFFFF]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#4B5563] dark:text-[#9CA3AF]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-xs text-[#111827] dark:text-[#FFFFFF] focus:outline-none cursor-pointer pr-1 font-medium dark:bg-[#080B09]"
            >
              <option value="newest" className="dark:bg-[#080B09]">Newest First</option>
              <option value="oldest" className="dark:bg-[#080B09]">Oldest First</option>
              <option value="cost_desc" className="dark:bg-[#080B09]">Cost (High → Low)</option>
              <option value="cost_asc" className="dark:bg-[#080B09]">Cost (Low → High)</option>
            </select>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={onExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B4332] dark:bg-[#52B788] text-white dark:text-[#000000] rounded-xl text-xs font-semibold hover:bg-[#2D6A4F] dark:hover:bg-[#40916C] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Download CSV audit log"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>

      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#4B5563] dark:text-[#9CA3AF] pt-3 border-t border-[#E5E7EB] dark:border-[#1F2622]">
        <span>
          Showing <strong className="text-[#111827] dark:text-[#FFFFFF] font-numeric font-bold">{totalFiltered}</strong> matching records
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        <span className="font-mono text-[11px] text-[#4B5563] dark:text-[#9CA3AF]">
          Sorted by: {sortBy.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}
