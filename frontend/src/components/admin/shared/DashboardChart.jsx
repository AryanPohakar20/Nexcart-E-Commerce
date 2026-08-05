import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2 } from 'react-icons/fi';

// Pure SVG chart — no external libraries
const DashboardChart = ({
  data = [],
  dataKey = 'revenue',
  label = 'Revenue',
  color = '#FFC107',
  height = 220,
  showGrid = true,
  type = 'area', // 'area' | 'bar'
  prefix = '₹',
  formatK = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');

  const PADDING = { top: 20, right: 20, bottom: 40, left: 55 };
  const WIDTH = 100; // percentage-based viewBox
  const HEIGHT = height;
  const innerW = 800;
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;

  const values = data.map((d) => d[dataKey] || 0);
  const maxVal = Math.max(...values, 1);
  const minVal = 0;

  const formatVal = (v) => {
    if (!formatK) return `${prefix}${v.toLocaleString('en-IN')}`;
    if (v >= 10000000) return `${prefix}${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `${prefix}${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `${prefix}${(v / 1000).toFixed(0)}K`;
    return `${prefix}${v}`;
  };

  const points = data.map((d, i) => {
    const x = PADDING.left + (i / Math.max(data.length - 1, 1)) * (innerW - PADDING.left - PADDING.right);
    const y = PADDING.top + (1 - (d[dataKey] - minVal) / (maxVal - minVal)) * innerH;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${PADDING.top + innerH} L ${points[0].x} ${PADDING.top + innerH} Z`
    : '';

  // Grid lines
  const gridLines = showGrid ? [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: PADDING.top + ratio * innerH,
    label: formatVal(maxVal * (1 - ratio)),
  })) : [];

  // Bar chart
  const barWidth = data.length > 0 ? ((innerW - PADDING.left - PADDING.right) / data.length) * 0.6 : 30;

  return (
    <div className="w-full">
      {/* Chart SVG */}
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${innerW} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={g.y}
                x2={innerW - PADDING.right}
                y2={g.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text x={PADDING.left - 8} y={g.y + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.3)" fontFamily="Poppins, sans-serif">
                {g.label}
              </text>
            </g>
          ))}

          {type === 'area' && points.length > 1 && (
            <>
              {/* Area fill */}
              <path d={areaD} fill={`url(#grad-${dataKey})`} />
              {/* Line */}
              <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Data points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIndex === i ? 6 : 4}
                    fill={color}
                    stroke="#1A1A1A"
                    strokeWidth="2"
                    style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {hoveredIndex === i && (
                    <>
                      <rect x={p.x - 40} y={p.y - 38} width="80" height="28" rx="6" fill="#2A2A2A" stroke={color} strokeWidth="1" />
                      <text x={p.x} y={p.y - 20} textAnchor="middle" fontSize="12" fill={color} fontFamily="Poppins, sans-serif" fontWeight="700">
                        {formatVal(p[dataKey])}
                      </text>
                    </>
                  )}
                </g>
              ))}
            </>
          )}

          {type === 'bar' && points.map((p, i) => {
            const barH = (p[dataKey] / maxVal) * innerH;
            const bx = p.x - barWidth / 2;
            const by = PADDING.top + innerH - barH;
            return (
              <g key={i}>
                <rect
                  x={bx}
                  y={by}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  fill={hoveredIndex === i ? color : `${color}99`}
                  style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {hoveredIndex === i && (
                  <>
                    <rect x={p.x - 40} y={by - 32} width="80" height="26" rx="6" fill="#2A2A2A" stroke={color} strokeWidth="1" />
                    <text x={p.x} y={by - 14} textAnchor="middle" fontSize="12" fill={color} fontFamily="Poppins, sans-serif" fontWeight="700">
                      {formatVal(p[dataKey])}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* X-axis labels */}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.3)" fontFamily="Poppins, sans-serif">
              {p.month || p.label || i + 1}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

// Chart Card wrapper
export const ChartCard = ({ title, subtitle, children, actions }) => (
  <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 h-full">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    {children}
  </div>
);

export default DashboardChart;
