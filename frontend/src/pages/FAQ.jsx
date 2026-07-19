import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is the shipping cost at NexCart?', a: 'We offer free delivery on orders above ₹20,000. For orders below this value, a flat shipping fee of ₹150 applies.' },
    { q: 'How long does a refund take?', a: 'Refunds are initiated immediately upon cancellation or product return approvals and reflect in your payment source within 3-5 business days.' },
    { q: 'Can I sell my products on NexCart?', a: 'Yes! Click "Become Seller" in the navigation bar to switch your account and set up your vendor products dashboard.' },
    { q: 'What is the standard warranty period?', a: 'All electronics items have a standard 1 Year Brand Warranty unless specified otherwise in details sheets.' }
  ];

  return (
    <div className="space-y-8 text-left max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xs text-gray-500 mt-1">Review standard guidelines regarding orders, refunds, and vendor settings.</p>
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx} 
              className="bg-cardBg border border-white/5 rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
            >
              <div className="p-5 flex justify-between items-center text-xs font-bold text-white hover:text-primary transition-all">
                <span>{faq.q}</span>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-gray-400 leading-relaxed font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FAQ;
