import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="space-y-8 text-left max-w-3xl mx-auto text-xs text-gray-400 font-medium leading-relaxed">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-[10px] text-gray-500 mt-1">Last Updated: July 2026</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Data Aggregation</h3>
        <p>We collect essential information to authenticate login credentials, ship orders, and customize dashboard recommendations. This includes name, phone, shipping addresses, and cookies logs.</p>
        
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Security Authorizations</h3>
        <p>All credit card, debit card, and UPI transfers are routed securely via certified payment gateway partners. NexCart never saves CVVs or pins inside internal server vaults.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
