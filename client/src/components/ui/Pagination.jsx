import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable dark-mode Pagination component.
 */
export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  // Compute page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-slate-950/70 border-t border-slate-800/80 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-slate-200">{startItem}</strong> to{' '}
          <strong className="text-slate-200">{endItem}</strong> of{' '}
          <strong className="text-slate-200">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 outline-none hover:border-slate-700 focus:border-indigo-500 font-medium"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`min-w-[28px] h-7 px-2 rounded font-semibold transition-colors ${
              currentPage === p
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
