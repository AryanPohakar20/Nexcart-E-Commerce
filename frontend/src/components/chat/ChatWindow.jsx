import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, FiInfo, FiX, FiMessageSquare, FiLock, 
  FiCheckCircle, FiDollarSign, FiCalendar, FiMapPin, FiZap,
  FiArrowDown, FiRefreshCw
} from 'react-icons/fi';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

const ChatWindow = ({
  conversation,
  isTyping: isTypingProp = false,
  onBack,
  onSendMessage,
  onTyping,
  onStopTyping,
  onAcceptOffer,
  onDeclineOffer,
  onCounterOffer,
  onConfirmMeetup,
  onOpenOfferModal,
  onOpenMeetupModal,
  onOpenLocationModal,
  onOpenReportModal,
  onOpenBlockModal,
  onOpenProductModal,
  onClearChat,
  isBlocked,
  onReload,
  isRefreshing = false
}) => {
  const [showSafetyBanner, setShowSafetyBanner] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const isTyping = isTypingProp;

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Boolean ref tracking auto-scroll eligibility based on user scroll boundary
  const shouldAutoScroll = useRef(true);

  // Persistent refs for conversation identity, message history, and viewport measurements
  const prevConvIdRef = useRef(null);
  const prevMessagesRef = useRef([]);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const userJustSentRef = useRef(false);

  // Container-only scroll function. Replaced scrollIntoView to prevent page-level scroll jumping.
  const scrollToBottom = (behavior = 'smooth') => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (behavior === 'smooth') {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }

    setShowNewMessageButton(false);
    shouldAutoScroll.current = true;
  };

  // Detect whether user is near bottom (<100px) on every scroll event and update shouldAutoScroll.current
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom < 100;

    shouldAutoScroll.current = isNearBottom;
    prevScrollTopRef.current = container.scrollTop;

    // Automatically hide floating button when user scrolls back near the bottom
    if (isNearBottom && showNewMessageButton) {
      setShowNewMessageButton(false);
    }
  };

  // Scroll to bottom ONCE when opening a conversation for the first time
  useEffect(() => {
    if (!conversation) return;
    const currentConvId = conversation.id;

    if (currentConvId !== prevConvIdRef.current) {
      scrollToBottom('auto');
      prevConvIdRef.current = currentConvId;
      prevMessagesRef.current = conversation.messages || [];
      shouldAutoScroll.current = true;
    }
  }, [conversation?.id]);

  // Handle message updates without unconditional scrolling or layout jumps
  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container || !conversation) return;

    const currentMessages = conversation.messages || [];
    const prevMessages = prevMessagesRef.current;

    // Process message changes for the current active conversation
    if (conversation.id === prevConvIdRef.current && currentMessages !== prevMessages) {
      const isPrepended = 
        prevMessages.length > 0 && 
        currentMessages.length > prevMessages.length && 
        currentMessages[0]?.id !== prevMessages[0]?.id;

      if (isPrepended) {
        // Loading older messages: preserve exact viewport scroll position
        const deltaHeight = container.scrollHeight - prevScrollHeightRef.current;
        container.scrollTop = prevScrollTopRef.current + deltaHeight;
      } else if (currentMessages.length > prevMessages.length) {
        const lastMsg = currentMessages[currentMessages.length - 1];
        const isUserSent = lastMsg?.senderId === 'current-user' || userJustSentRef.current;

        if (isUserSent) {
          // User sent a message -> scroll to bottom
          scrollToBottom('smooth');
          userJustSentRef.current = false;
        } else {
          // Incoming message -> scroll ONLY if user is already near bottom
          if (shouldAutoScroll.current) {
            scrollToBottom('smooth');
          } else {
            // Preserve current scroll position & show new message badge
            setShowNewMessageButton(true);
          }
        }
      }

      prevMessagesRef.current = currentMessages;
    }

    prevScrollHeightRef.current = container.scrollHeight;
    prevScrollTopRef.current = container.scrollTop;
  }, [conversation?.messages]);

  // Wrapper for sending message
  const handleSendWrapper = (msgData) => {
    userJustSentRef.current = true;
    onSendMessage(msgData);
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

          {onReload && (
            <div className="pt-2">
              <button
                onClick={onReload}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <FiRefreshCw className={`text-xs ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
                <span>{isRefreshing ? 'Reloading Chats...' : 'Reload Conversations'}</span>
              </button>
            </div>
          )}
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
        onReload={onReload}
        isRefreshing={isRefreshing}
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
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative"
      >
        
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
            onCounterOffer={onCounterOffer}
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

      {/* Floating "New Messages ↓" Button */}
      <AnimatePresence>
        {showNewMessageButton && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all cursor-pointer backdrop-blur-md border border-white/20 active:scale-95 select-none"
          >
            <span>New Messages</span>
            <FiArrowDown className="text-sm animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Message Composer */}
      <MessageComposer
        onSendMessage={handleSendWrapper}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        isBlocked={isBlocked}
      />
    </div>
  );
};

export default ChatWindow;
