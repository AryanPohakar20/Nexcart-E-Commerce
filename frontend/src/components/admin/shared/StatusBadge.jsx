import React from 'react';

const statusConfig = {
  // User / General statuses
  active: { label: 'Active', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  inactive: { label: 'Inactive', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
  suspended: { label: 'Suspended', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  blocked: { label: 'Blocked', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  draft: { label: 'Draft', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
  scheduled: { label: 'Scheduled', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  published: { label: 'Published', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  unpublished: { label: 'Unpublished', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  // Verification statuses
  pending: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  approved: { label: 'Approved', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  verified: { label: 'Verified', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  unverified: { label: 'Unverified', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
  // Order statuses
  processing: { label: 'Processing', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  shipped: { label: 'Shipped', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  // Payment statuses
  paid: { label: 'Paid', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  refunded: { label: 'Refunded', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  // Product statuses
  out_of_stock: { label: 'Out of Stock', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  featured: { label: 'Featured', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  // Audit statuses
  success: { label: 'Success', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  failed: { label: 'Failed', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  // Seller types
  marketplace_seller: { label: 'Marketplace', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  seller: { label: 'Standard', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  customer: { label: 'Customer', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
  promotion: { label: 'Promotion', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  offer: { label: 'Offer', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  discount: { label: 'Discount', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  recommendation: { label: 'Recommendation', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  announcement: { label: 'Announcement', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  'order update': { label: 'Order Update', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  'seller update': { label: 'Seller Update', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', dot: 'bg-sky-400' },
  'product update': { label: 'Product Update', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  'account alert': { label: 'Account Alert', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' },
  'security alert': { label: 'Security Alert', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  maintenance: { label: 'Maintenance', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  'system update': { label: 'System Update', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  warning: { label: 'Warning', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  error: { label: 'Error', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  information: { label: 'Information', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
  'system alert': { label: 'System Alert', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-400' },
  custom: { label: 'Custom', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-400' },
};

const StatusBadge = ({ status, showDot = true, size = 'sm' }) => {
  const config = statusConfig[status] || statusConfig.inactive;
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : size === 'md'
    ? 'text-xs px-2.5 py-1'
    : 'text-sm px-3 py-1.5';

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider border
      ${config.bg} ${config.text} ${config.border} ${sizeClasses}
    `}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
