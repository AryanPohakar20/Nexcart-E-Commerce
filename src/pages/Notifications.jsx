import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FiBell, FiChevronRight, FiTrash2, FiCheckCircle } from 'react-icons/fi';

const Notifications = () => {
  const { notifications, markNotificationRead, clearNotifications } = useContext(AppContext);

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="border-b border-white/5 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2">
            <Link to="/" className="hover:underline">Home</Link>
            <FiChevronRight />
            <span className="text-white">Notifications</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FiBell className="text-primary" />
            <span>Alerts & Notifications ({notifications.length})</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Review system updates, coupon additions, and tracking logs.</p>
        </div>

        {notifications.length > 0 && (
          <button 
            onClick={clearNotifications}
            className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          >
            <FiTrash2 size={13} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Notifications listings */}
      <div className="max-w-2xl mx-auto space-y-4">
        {notifications.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white/5 shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 mb-4">
              <FiBell size={28} />
            </div>
            <h2 className="text-sm font-bold text-white mb-1">No Alerts Received</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">All clean! Any order dispatch, return updates, or promos will appear here.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => markNotificationRead(notif.id)}
              className={`bg-cardBg border p-5 rounded-2xl flex items-start justify-between gap-4 cursor-pointer hover:border-primary/20 transition-all ${
                notif.read ? 'border-white/5 opacity-60' : 'border-l-4 border-primary pl-4 border-white/10'
              }`}
            >
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0 animate-ping" />}
                  <span>{notif.title}</span>
                </h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">{notif.message}</p>
                <span className="text-[10px] text-gray-500 font-bold block">{notif.time}</span>
              </div>

              {!notif.read && (
                <button 
                  onClick={(e) => { e.stopPropagation(); markNotificationRead(notif.id); }}
                  className="text-primary hover:text-white p-1"
                  title="Mark as Read"
                >
                  <FiCheckCircle size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
