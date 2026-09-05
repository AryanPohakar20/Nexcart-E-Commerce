import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiX, FiCheck, FiNavigation, FiShield } from 'react-icons/fi';
import { SAFE_MEETUP_SPOTS } from '../../constants/chatData';

const ShareLocationModal = ({ isOpen, onClose, onShareLocation }) => {
  const [selectedSpot, setSelectedSpot] = useState(SAFE_MEETUP_SPOTS[0]);
  const [address, setAddress] = useState('Central Plaza Metro Lobby, Floor 1');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onShareLocation({
      title: `Safe Spot: ${selectedSpot}`,
      address: address,
      coords: '37.7749, -122.4194'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 relative"
      >
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accentBlue/10 text-accentBlue flex items-center justify-center font-bold">
              <FiMapPin className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Share Safe Location
              </h3>
              <p className="text-xs text-gray-500">Pick a verified safe public location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Mock Map Preview Box */}
        <div className="relative h-32 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 overflow-hidden mb-4 border border-white/10 flex items-center justify-center text-center p-4">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00C8FF_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 text-white space-y-1">
            <FiMapPin className="text-3xl text-accentBlue mx-auto animate-bounce" />
            <span className="text-xs font-bold block">{selectedSpot}</span>
            <span className="text-[10px] text-gray-300">NexCart Verified Safe Zone</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Select Safe Location:
            </label>
            <select
              value={selectedSpot}
              onChange={(e) => setSelectedSpot(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-2xl bg-gray-100 dark:bg-[#252528] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-accentBlue"
            >
              {SAFE_MEETUP_SPOTS.map((spot, idx) => (
                <option key={idx} value={spot}>{spot}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Exact Landmark / Address Details:
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-accentBlue"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-accentBlue text-black font-bold text-xs rounded-2xl hover:bg-opacity-90 shadow-lg shadow-accentBlue/20 transition-all"
            >
              Share Location Card
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ShareLocationModal;
