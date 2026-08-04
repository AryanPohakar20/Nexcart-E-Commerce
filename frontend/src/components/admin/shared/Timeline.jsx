import React from 'react';
import { motion } from 'framer-motion';

const Timeline = ({ events = [] }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-2 bottom-2 w-px bg-white/8" />

      <div className="space-y-4">
        {events.map((event, i) => {
          const Icon = event.icon;
          const colorMap = {
            user: { dot: 'bg-cyan-500', ring: 'ring-cyan-500/20', text: 'text-cyan-400' },
            order: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-400' },
            seller: { dot: 'bg-purple-500', ring: 'ring-purple-500/20', text: 'text-purple-400' },
            product: { dot: 'bg-yellow-500', ring: 'ring-yellow-500/20', text: 'text-yellow-400' },
            verification: { dot: 'bg-blue-500', ring: 'ring-blue-500/20', text: 'text-blue-400' },
            category: { dot: 'bg-orange-500', ring: 'ring-orange-500/20', text: 'text-orange-400' },
            settings: { dot: 'bg-gray-500', ring: 'ring-gray-500/20', text: 'text-gray-400' },
            success: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', text: 'text-emerald-400' },
            failed: { dot: 'bg-red-500', ring: 'ring-red-500/20', text: 'text-red-400' },
            default: { dot: 'bg-gray-600', ring: 'ring-gray-600/20', text: 'text-gray-400' },
          };
          const c = colorMap[event.type] || colorMap.default;

          return (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 pl-0"
            >
              {/* Dot */}
              <div className={`relative z-10 w-10 h-10 flex-shrink-0 ${c.dot} ring-4 ${c.ring} rounded-full flex items-center justify-center`}>
                {Icon && <Icon size={14} className="text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-[#1E1E1E] border border-white/5 rounded-xl p-3.5 hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{event.event || event.action}</p>
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{event.time || event.timestamp}</span>
                  </div>
                  {event.detail && <p className="text-xs text-gray-400">{event.detail}</p>}
                  {event.remarks && <p className="text-xs text-gray-500 mt-1 italic">"{event.remarks}"</p>}
                  {event.target && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600">Target:</span>
                      <span className="text-xs text-gray-400">{event.target}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
