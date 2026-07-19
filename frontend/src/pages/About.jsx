import React from 'react';
import { FiTrendingUp, FiActivity, FiGlobe } from 'react-icons/fi';

const About = () => {
  return (
    <div className="space-y-12 text-left max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">About NexCart</h1>
        <p className="text-xs text-gray-500 mt-1">Discover our vision, core values, and eCommerce milestones.</p>
      </div>

      {/* Main Vision Statement */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="bg-primary/20 border border-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">Our Vision</span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">We build the future of eCommerce portals.</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            At NexCart, we believe shopping should have no limits. We merge premium visual design, bleeding-edge performance optimization, and ultra-secure checkout workflows to shape a delightful customer experience.
          </p>
        </div>
        <div className="h-64 rounded-3xl overflow-hidden border border-white/5">
          <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80" alt="Vision" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Core Values grid */}
      <section className="space-y-6 pt-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center">Core Pillars</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-3">
            <FiActivity className="text-primary text-2xl" />
            <h4 className="font-bold text-white text-sm">Ultra Performance</h4>
            <p className="text-xs text-gray-400 leading-relaxed">No laggy load lines. We ensure instant responses, smooth slide panels, and prompt payments.</p>
          </div>

          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-3">
            <FiTrendingUp className="text-primary text-2xl" />
            <h4 className="font-bold text-white text-sm">Seller Incubation</h4>
            <p className="text-xs text-gray-400 leading-relaxed">We provide specialized charts, products logs, and analytics metrics to vendor members.</p>
          </div>

          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-3">
            <FiGlobe className="text-primary text-2xl" />
            <h4 className="font-bold text-white text-sm">Global Scale</h4>
            <p className="text-xs text-gray-400 leading-relaxed">Shipping cross-borders, supporting diverse currencies, and translating language portals easily.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
