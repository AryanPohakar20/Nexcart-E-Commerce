import React from 'react';
import { FiDownload, FiPlus, FiTrash2, FiPauseCircle, FiCheckCircle } from 'react-icons/fi';
import SearchBar from './SearchBar';

const TableToolbar = ({
  search,
  onSearch,
  onSearchClear,
  searchPlaceholder,
  filters,
  bulkActions,
  selectedCount = 0,
  onExport,
  onCreate,
  createLabel = 'Create',
  children,
}) => {
  return (
    <div className="px-4 py-3 border-b border-white/5 space-y-3">
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {onSearch !== undefined && (
          <SearchBar
            value={search}
            onChange={onSearch}
            onClear={onSearchClear}
            placeholder={searchPlaceholder}
          />
        )}

        {/* Filters */}
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 h-9 px-3 text-xs font-semibold text-gray-400 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 rounded-xl transition-all"
            >
              <FiDownload size={14} />
              Export
            </button>
          )}
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-black bg-yellow-500 hover:bg-yellow-400 rounded-xl transition-all shadow-[0_0_15px_rgba(255,193,7,0.3)] hover:shadow-[0_0_20px_rgba(255,193,7,0.5)]"
            >
              <FiPlus size={14} />
              {createLabel}
            </button>
          )}
        </div>

        {/* Extra content slot */}
        {children}
      </div>

      {/* Bulk actions bar */}
      {selectedCount > 0 && bulkActions && (
        <div className="flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-2.5 animate-in slide-in-from-top duration-200">
          <span className="text-xs font-bold text-yellow-400">{selectedCount} selected</span>
          <div className="w-px h-4 bg-white/10" />
          {bulkActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all
                  ${action.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : action.success
                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-gray-300 hover:bg-white/8'
                  }`}
              >
                {Icon && <Icon size={13} />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableToolbar;
