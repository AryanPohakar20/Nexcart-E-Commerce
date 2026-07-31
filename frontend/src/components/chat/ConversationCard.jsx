import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiCheckCircle, FiTag, FiClock, FiDollarSign } from 'react-icons/fi';

const ConversationCard = ({ conversation, isSelected, onClick }) => {
  const { partner, product, lastMessageTimestamp, unreadCount, messages } = conversation;
  const lastMessage = messages[messages.length - 1];

  const renderPreviewContent = () => {
    if (!lastMessage) return "No messages yet";

    if (lastMessage.type === 'offer') {
      return (
        <span className="inline-flex items-center gap-1 text-primary font-medium">
          <FiDollarSign className="text-xs flex-shrink-0" />
          Price Offer: ${lastMessage.offerDetails?.amount || product.price}
        </span>
      );
    }
    
    if (lastMessage.type === 'meetup') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
          <FiClock className="text-xs flex-shrink-0" />
          Meetup Scheduled
        </span>
      );
    }

    if (lastMessage.type === 'location') {
      return <span className="text-accentBlue font-medium">📍 Location Shared</span>;
    }

    if (lastMessage.type === 'image') {
      return <span>📷 Photo attached</span>;
    }

    return (
      <span className="truncate">
        {lastMessage.senderId === 'current-user' && <span className="text-gray-400 mr-1">You:</span>}
        {lastMessage.text}
      </span>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 0.995 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`relative p-3.5 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-primary/40 shadow-lg shadow-primary/5 dark:bg-primary/10'
          : 'bg-white/40 dark:bg-white/[0.03] border-transparent hover:bg-black/5 dark:hover:bg-white/[0.06] hover:border-gray-200 dark:hover:border-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* User Avatar with Online status indicator */}
        <div className="relative flex-shrink-0">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20 shadow-sm"
          />
          {partner.online ? (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#121212] rounded-full shadow-sm" />
          ) : (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-gray-400 border-2 border-[#121212] rounded-full" />
          )}
        </div>

        {/* Conversation Details */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Partner Name & Role & Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {partner.name}
              </h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                partner.role === 'Seller' 
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}>
                {partner.role}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-400 flex-shrink-0 font-medium">
              {lastMessageTimestamp}
            </span>
          </div>

          {/* Product Thumbnail Tag */}
          <div className="flex items-center gap-2 mb-1.5 bg-gray-100/80 dark:bg-white/5 p-1 px-2 rounded-lg border border-gray-200/50 dark:border-white/5">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-4 h-4 rounded object-cover flex-shrink-0"
            />
            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">
              {product.title}
            </span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-primary ml-auto flex-shrink-0">
              ${product.price}
            </span>
          </div>

          {/* Message Preview & Unread Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-gray-600 dark:text-gray-300 truncate flex items-center gap-1">
              {lastMessage?.senderId === 'current-user' && (
                <span className="text-primary flex-shrink-0">
                  {lastMessage.status === 'read' ? (
                    <FiCheckCircle className="text-[11px] text-emerald-400 inline" />
                  ) : (
                    <FiCheck className="text-[11px] text-gray-400 inline" />
                  )}
                </span>
              )}
              {renderPreviewContent()}
            </div>

            {unreadCount > 0 && (
              <span className="bg-primary text-black font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationCard;
