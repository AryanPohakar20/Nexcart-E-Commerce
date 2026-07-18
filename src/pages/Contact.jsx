import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheck } from 'react-icons/fi';

const Contact = () => {
  const { showToast } = useContext(AppContext);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      showToast('Support Query Submitted successfully!');
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="space-y-12 text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Contact Support</h1>
        <p className="text-xs text-gray-500 mt-1">Get in touch with customer care or seller business teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Details details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-cardBg border border-white/5 p-6 rounded-3xl space-y-4 text-xs text-gray-400">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">NexCart Headquarters</h4>
            
            <div className="flex items-center gap-3">
              <FiMapPin className="text-primary text-base flex-shrink-0" />
              <span>Skyview Hub, Hitec City, Hyderabad, 500081</span>
            </div>
            
            <div className="flex items-center gap-3">
              <FiPhone className="text-primary text-base flex-shrink-0" />
              <span>+91 1800 200 9999</span>
            </div>
            
            <div className="flex items-center gap-3">
              <FiMail className="text-primary text-base flex-shrink-0" />
              <span>support@nexcart.com</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact form */}
        <div className="md:col-span-2 bg-cardBg border border-white/5 p-6 md:p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Your Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Alex" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1 font-bold">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="alex@gmail.com" 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-bold">Subject Topic</label>
              <input 
                type="text" 
                value={formData.subject}
                onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                placeholder="Shipping delays or login issues" 
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none" 
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1 font-bold">Description Details</label>
              <textarea 
                rows="4" 
                value={formData.message}
                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                placeholder="Type query detail..." 
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none" 
                required
              />
            </div>

            <button 
              type="submit" 
              className={`w-full btn-glow-yellow !py-3 text-xs text-black font-extrabold rounded-lg flex items-center justify-center gap-1.5 ${submitted ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              {submitted ? (
                <><FiCheck /> <span>Submitted Query</span></>
              ) : (
                <><FiSend /> <span>Dispatch Support Message</span></>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
