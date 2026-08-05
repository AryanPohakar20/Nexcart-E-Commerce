import React from 'react';
import { FiUser, FiBriefcase } from 'react-icons/fi';

const SellerBadge = ({ sellerType, className = '' }) => {
  if (sellerType === 'business') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 shadow-yellow-glow ${className}`}>
        <FiBriefcase size={10} />
        <span>Small Business</span>
      </span>
    );
  }

  // Individual C2C
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accentBlue/10 text-accentBlue border border-accentBlue/20 ${className}`}>
      <FiUser size={10} />
      <span>Individual Seller</span>
    </span>
  );
};

export default SellerBadge;
