import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiX, FiShield } from 'react-icons/fi';
import { SAFE_MEETUP_SPOTS } from '../../constants/chatData';

const ScheduleMeetupModal = ({ isOpen, onClose, onSubmitMeetup }) => {
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('03:00 PM');
  const [location, setLocation] = useState(SAFE_MEETUP_SPOTS[0]);
  const [customLocation, setCustomLocation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalLocation = customLocation.trim() || location;
    onSubmitMeetup({
      date,
      time,
      location: finalLocation
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
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <FiCalendar className="text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Schedule Safe Meetup
              </h3>
              <p className="text-xs text-gray-500">Agree on a public exchange location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Date Options */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Meetup Date:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Today', 'Tomorrow', 'This Weekend'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    date === d
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                      : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Meetup Time:
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g., 03:00 PM"
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Verified Safe Spot Preset Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Verified Safe Meetup Spots:</span>
              <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-bold">
                <FiShield /> Recommended
              </span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-2xl bg-gray-100 dark:bg-[#252528] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {SAFE_MEETUP_SPOTS.map((spot, idx) => (
                <option key={idx} value={spot}>
                  {spot}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Spot Override */}
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
              Or Type Custom Public Location:
            </label>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="e.g., Public Library Lobby, 4th Ave"
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
              className="flex-1 py-3 bg-emerald-500 text-white font-bold text-xs rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Propose Meetup
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ScheduleMeetupModal;
