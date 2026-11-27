import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  record,
  onConfirm,
  onCancel,
  deleting
}) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div 
        className="bg-white dark:bg-[#0F1412] rounded-2xl border border-[#E5E7EB] dark:border-[#1F2622] shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F2D8C9]/60 dark:bg-rose-950/50 text-[#D98C72] dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#FFFFFF] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-normal text-[#111827] dark:text-[#FFFFFF]">
            Delete Prediction Record #{record.id}?
          </h3>
          <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
            This will permanently remove audit record <strong className="font-numeric text-[#111827] dark:text-[#FFFFFF]">#{record.id}</strong> ({record.model_type === 'model_b' ? 'Model B Clinical' : 'Model A Basic'}, predicted cost <strong className="font-numeric text-[#1B4332] dark:text-[#52B788]">${record.predicted_cost?.toLocaleString()}</strong>) from the SQLite audit database.
          </p>
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#080B09] border border-[#E5E7EB] dark:border-[#1F2622] rounded-xl text-[11px] text-[#4B5563] dark:text-[#9CA3AF] font-mono">
            Timestamp: {record.timestamp || 'N/A'}
          </div>
        </div>

        {/* Warning callout */}
        <p className="text-xs text-[#8B4B32] dark:text-rose-300 bg-[#F2D8C9]/50 dark:bg-rose-950/40 border border-[#F2D8C9] dark:border-rose-900/60 p-3 rounded-xl font-medium leading-relaxed">
          Warning: This action cannot be undone. Historical audit integrity will be permanently altered.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB] dark:border-[#1F2622]">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-xl border border-[#E5E7EB] dark:border-[#1F2622] text-xs font-semibold text-[#4B5563] dark:text-[#9CA3AF] hover:bg-[#FBFBFA] dark:hover:bg-[#121714] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(record.id)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D98C72] text-white rounded-xl text-xs font-semibold hover:bg-[#8B4B32] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting...' : 'Confirm Deletion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
