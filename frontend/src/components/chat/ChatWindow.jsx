import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiInfo, FiX, FiMessageSquare, FiLock, 
  FiCheckCircle, FiDollarSign, FiCalendar, FiMapPin, FiZap
} from 'react-icons/fi';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

const ChatWindow = ({
  conversation,
  onBack,
  onSendMessage,
  onAcceptOffer,
  onDeclineOffer,
  onConfirmMeetup,
  onOpenOfferModal,
  onOpenMeetupModal,
  onOpenLocationModal,
  onOpenReportModal,
  onOpenBlockModal,
  onOpenProductModal,
  onClearChat,
  isBlocked
}) => {
  const [showSafetyBanner, setShowSafetyBanner] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, isTyping]);

  // Simulate typing indicator when new message is sent by current user
  const handleSendWrapper = (msgData) => {
    onSendMessage(msgData);
    
    // Simulate seller/buyer typing back after 1.5s
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2500);
    }, 1200);
  };

  // If no conversation is active / selected
  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50/50 dark:bg-[#0E0E10] border-l border-gray-200/50 dark:border-white/5 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md space-y-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary/20 via-amber-400/20 to-accentBlue/20 text-primary flex items-center justify-center mx-auto shadow-inner border border-primary/20">
            <FiMessageSquare className="text-4xl" />
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
            NexCart C2C Marketplace Chat
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Select a conversation from the left sidebar to negotiate prices, schedule safe local meetups, and chat directly with buyers or sellers.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 text-xs space-y-1">
              <span className="font-bold text-amber-500 flex items-center gap-1">
                <FiDollarSign /> Price Offers
              </span>
              <p className="text-[11px] text-gray-400">Make and accept official price offers with 1-click contracts.</p>
            </div>
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 text-xs space-y-1">
              <span className="font-bold text-emerald-500 flex items-center gap-1">
                <FiCalendar /> Safe Meetups
              </span>
              <p className="text-[11px] text-gray-400">Arrange meetings at verified safe public exchange zones.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const { partner, product, messages } = conversation;

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB] dark:bg-[#0E0E10] relative overflow-hidden transition-colors">
      
      {/* 1. Chat Header */}
      <ChatHeader
        partner={partner}
        product={product}
        onBack={onBack}
        onOpenOfferModal={onOpenOfferModal}
        onOpenMeetupModal={onOpenMeetupModal}
        onOpenLocationModal={onOpenLocationModal}
        onOpenReportModal={onOpenReportModal}
        onOpenBlockModal={onOpenBlockModal}
        onOpenProductModal={onOpenProductModal}
        onClearChat={onClearChat}
        isBlocked={isBlocked}
      />

      {/* 2. Safety Tips Banner */}
      <AnimatePresence>
        {showSafetyBanner && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FiShield className="text-amber-500 text-sm flex-shrink-0" />
              <span className="truncate">
                Safety Tip: <strong>Never pay in advance.</strong> Meet in a safe public place & inspect the item.
              </span>
            </div>
            <button
              onClick={() => setShowSafetyBanner(false)}
              className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-white flex-shrink-0"
            >
              <FiX className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Messages Stream Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* Encrypted Safety Header Badge */}
        <div className="flex justify-center my-2">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-white/5 px-3 py-1 rounded-full border border-gray-300/40 dark:border-white/5 flex items-center gap-1.5 shadow-xs">
            <FiLock className="text-amber-500 text-xs" /> End-to-End Encrypted Marketplace Chat
          </span>
        </div>

        {/* Date Separator */}
        <div className="flex items-center justify-center my-3">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-white/10 px-3 py-0.5 rounded-full">
            Today
          </span>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            partner={partner}
            product={product}
            onAcceptOffer={onAcceptOffer}
            onDeclineOffer={onDeclineOffer}
            onConfirmMeetup={onConfirmMeetup}
            onOpenLocation={onOpenLocationModal}
          />
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 my-2"
          >
            <img src={partner.avatar} alt={partner.name} className="w-6 h-6 rounded-full object-cover" />
            <div className="bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <span className="text-[11px] font-medium text-gray-500 ml-1">{partner.name} is typing...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Message Composer */}
      <MessageComposer
        onSendMessage={handleSendWrapper}
        isBlocked={isBlocked}
      />
    </div>
  );
};

export default ChatWindow;
