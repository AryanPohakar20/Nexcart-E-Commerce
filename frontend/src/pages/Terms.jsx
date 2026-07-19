import React from 'react';

const Terms = () => {
  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto text-xs text-gray-400 font-medium leading-relaxed">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Terms & Conditions</h1>
        <p className="text-[10px] text-gray-500 mt-1">Last Updated: July 2026</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Acceptance of Terms</h3>
        <p>By using the NexCart eCommerce store, you agree to comply with system access logs, return policies, and seller terms.</p>
        
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Account Memberships</h3>
        <p>Users must provide accurate email credentials during login and register phases. Suspended accounts are reviewed by Root admin control portals.</p>
      </div>
    </div>
  );
};

export default Terms;
