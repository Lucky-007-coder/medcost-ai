import React, { useState, useEffect, useCallback } from 'react';
import { getHistory, deleteHistory } from '../../services/api';
import { generateHistoryCSV, downloadCSV } from '../../utils/csvExport';
import HistoryStatsCards from './HistoryStatsCards';
import HistoryFilterToolbar from './HistoryFilterToolbar';
import HistoryTable from './HistoryTable';
import RecordDetailDrawer from './RecordDetailDrawer';
import DeleteConfirmModal from './DeleteConfirmModal';
import { 
  History, RefreshCw, CheckCircle2, AlertCircle, 
  FileSpreadsheet, ShieldAlert 
} from 'lucide-react';

export default function HistoryView({ onNavigateToEstimator }) {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Query & Pagination states
  const [modelFilter, setModelFilter] = useState('all'); // 'all' | 'model_a' | 'model_b'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'cost_desc' | 'cost_asc'
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals & Drawer states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch prediction history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit,
        offset: (page - 1) * limit,
        sort: sortBy,
      };

      if (modelFilter !== 'all') {
        params.model_type = modelFilter;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await getHistory(params);
      setRecords(res.records || []);
      setTotalCount(res.total_count || 0);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.response?.data?.error || err.message || 'Failed to retrieve prediction records from SQLite.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, modelFilter, searchQuery, sortBy]);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setPage(1);
  }, [modelFilter, searchQuery, sortBy]);

  // Fetch on state changes
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle individual record deletion
  const handleDeleteConfirm = async (recordId) => {
    try {
      setDeleting(true);
      await deleteHistory(recordId);

      setToast({
        type: 'success',
        message: `Prediction record #${recordId} was permanently deleted.`
      });

      // Close modals
      setRecordToDelete(null);
      if (selectedRecord && selectedRecord.id === recordId) {
        setSelectedRecord(null);
      }

      // Refresh list
      fetchHistory();
    } catch (err) {
      console.error('Delete failed:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to delete record.'
      });
    } finally {
      setDeleting(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      // Fetch all matching records (export=true)
      const params = {
        export: 'true',
        limit: 5000,
        sort: sortBy,
      };
      if (modelFilter !== 'all') {
        params.model_type = modelFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await getHistory(params);
      const allMatching = res.records || [];

      if (allMatching.length === 0) {
        setToast({
          type: 'error',
          message: 'No records available to export with current criteria.'
        });
        return;
      }

      const blob = generateHistoryCSV(allMatching);
      const today = new Date().toISOString().split('T')[0];
      const filename = `medcost_prediction_history_${today}.csv`;
      downloadCSV(blob, filename);

      setToast({
        type: 'success',
        message: `Exported ${allMatching.length} records to ${filename}.`
      });
    } catch (err) {
      console.error('CSV export failed:', err);
      setToast({
        type: 'error',
        message: 'Unable to generate CSV export file.'
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="py-12 md:py-20 bg-[#FBFBFA] dark:bg-[#000000] min-h-screen font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E5E7EB] dark:border-[#1F2622] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6EFEA] dark:bg-[#080B09] border border-[#C5DFD3] dark:border-[#1F2622] text-[#1B4332] dark:text-[#52B788] text-xs font-mono font-medium tracking-wider uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B4332] dark:bg-[#52B788]"></span>
              <span>Section 6 • Audit & Inference Logs</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#111827] dark:text-[#FFFFFF] tracking-tight">
              Prediction History & Audit Persistence
            </h1>
            <p className="text-[#4B5563] dark:text-[#9CA3AF] text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Historical ledger of OLS model predictions, patient intake parameters, and mathematical contribution breakdowns persisted to SQLite.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] text-[#111827] dark:text-[#FFFFFF] bg-white dark:bg-[#080B09] hover:bg-[#FBFBFA] dark:hover:bg-[#161D19] text-xs font-semibold transition-all shadow-sm self-start sm:self-auto disabled:opacity-50 cursor-pointer"
            title="Refresh SQLite history"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#4B5563] dark:text-[#9CA3AF] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit Log</span>
          </button>
        </div>

        {/* Toast Feedback Notification */}
        {toast && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success' 
              ? 'bg-[#E6EFEA] dark:bg-[#080B09] border-[#C5DFD3] dark:border-[#1F2622] text-[#1B4332] dark:text-[#52B788]' 
              : 'bg-[#F2D8C9] dark:bg-rose-950/50 border-[#D98C72] dark:border-rose-900/60 text-[#8B4B32] dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#1B4332] dark:text-[#52B788] flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#D98C72] dark:text-rose-400 flex-shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Global Audit Statistics Bar */}
        <HistoryStatsCards stats={stats} />

        {/* Filter & Search Toolbar */}
        <HistoryFilterToolbar
          modelFilter={modelFilter}
          setModelFilter={setModelFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onExportCSV={handleExportCSV}
          exporting={exporting}
          totalFiltered={totalCount}
        />

        {/* Error Banner */}
        {error && (
          <div className="p-5 bg-white border border-[#F2D8C9] rounded-2xl text-xs text-[#8B4B32] space-y-2 shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="w-4 h-4 text-[#D98C72]" />
              <span>Database Connection Error</span>
            </div>
            <p>{error}</p>
            <button
              onClick={fetchHistory}
              className="px-3.5 py-1.5 bg-[#D98C72] text-white rounded-lg font-semibold hover:bg-[#8B4B32] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* History Table & Pagination */}
        <HistoryTable
          records={records}
          loading={loading}
          totalRecords={totalCount}
          page={page}
          setPage={setPage}
          limit={limit}
          onViewRecord={(record) => setSelectedRecord(record)}
          onDeleteRequest={(record) => setRecordToDelete(record)}
          onNavigateToEstimator={onNavigateToEstimator}
        />

      </div>

      {/* Slide-over Detail Drawer */}
      <RecordDetailDrawer
        isOpen={Boolean(selectedRecord)}
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onDeleteRequest={(rec) => setRecordToDelete(rec)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(recordToDelete)}
        record={recordToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setRecordToDelete(null)}
        deleting={deleting}
      />

    </div>
  );
}
