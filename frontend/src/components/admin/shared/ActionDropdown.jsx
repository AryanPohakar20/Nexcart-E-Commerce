import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ActionDropdown = ({ actions = [], trigger }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-textSecondary hover:text-textPrimary hover:bg-surface transition-all"
      >
        {trigger || <FiMoreVertical size={16} />}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-9 z-50 min-w-[180px] bg-cardBg border border-borderColor rounded-xl shadow-2xl overflow-hidden"
          >
            {actions.map((action, i) => {
              if (action.type === 'divider') {
                return <div key={i} className="h-px bg-borderColor my-1" />;
              }
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action.onClick?.();
                  }}
                  disabled={action.disabled}
                  className={`
                    w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-left
                    transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                    ${action.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : action.warning
                      ? 'text-yellow-400 hover:bg-yellow-500/10'
                      : action.success
                      ? 'text-emerald-400 hover:bg-emerald-500/10'
                      : 'text-textSecondary hover:bg-surface hover:text-textPrimary'
                    }
                  `}
                >
                  {Icon && <Icon size={14} />}
                  {action.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActionDropdown;
