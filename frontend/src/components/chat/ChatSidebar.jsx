import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiFilter, FiMessageSquare, FiUser, FiShoppingBag, FiShield } from 'react-icons/fi';
import NexCartLogo from '../NexCartLogo';
import ConversationCard from './ConversationCard';

const ChatSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter
}) => {
  const filterTabs = [
    { id: 'all', label: 'All', count: conversations.length },
    { 
      id: 'unread', 
      label: 'Unread', 
      count: conversations.filter(c => c.unreadCount > 0).length 
    },
    { 
      id: 'buyers', 
      label: 'Buyers', 
      count: conversations.filter(c => c.partner.role === 'Buyer').length 
    },
    { 
      id: 'sellers', 
      label: 'Sellers', 
      count: conversations.filter(c => c.partner.role === 'Seller').length 
    }
  ];

  // Filter & Search Logic
  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // Filter tab check
      if (activeFilter === 'unread' && conv.unreadCount === 0) return false;
      if (activeFilter === 'buyers' && conv.partner.role !== 'Buyer') return false;
      if (activeFilter === 'sellers' && conv.partner.role !== 'Seller') return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = conv.partner.name.toLowerCase().includes(query);
        const matchesProduct = conv.product.title.toLowerCase().includes(query);
        const matchesMsg = conv.messages.some(m => m.text?.toLowerCase().includes(query));
        return matchesName || matchesProduct || matchesMsg;
      }

      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  return (
    <div className="h-full flex flex-col bg-white/70 dark:bg-[#121212]/80 backdrop-blur-xl border-r border-gray-200/80 dark:border-white/10 select-none overflow-hidden">
      
      {/* Sidebar Header: NexCart Branding */}
      <div className="px-5 py-3.5 border-b border-gray-200/60 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <NexCartLogo size="sm" className="scale-95 origin-left" />
          <div className="flex items-center pt-0.5">
            <span className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              Messenger <span className="bg-primary/20 text-[#FFA800] text-[10px] px-2 py-0.5 rounded-md font-extrabold tracking-wider">C2C</span>
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Marketplace
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages, buyers, sellers or items..."
            className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <FiX className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options (Tabs) */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200/60 dark:border-white/5 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-white/15 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive 
                      ? 'bg-primary text-black' 
                      : 'bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-4 custom-scrollbar">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === activeConversationId}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        ) : (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-400">
              <FiMessageSquare className="text-xl" />
            </div>
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
              No conversations found
            </p>
            <p className="text-[11px] text-gray-400">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        )}
      </div>

      {/* Footer Safety Tag */}
      <div className="p-3 border-t border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          <FiShield className="text-primary flex-shrink-0 text-xs" />
          <span className="truncate">NexCart End-to-End Buyer Protection</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
