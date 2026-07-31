import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { INITIAL_CONVERSATIONS } from '../constants/chatData';
import { PRODUCTS } from '../constants/dummyData';

import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

import OfferModal from '../components/chat/OfferModal';
import ScheduleMeetupModal from '../components/chat/ScheduleMeetupModal';
import ShareLocationModal from '../components/chat/ShareLocationModal';
import ReportUserModal from '../components/chat/ReportUserModal';
import BlockUserModal from '../components/chat/BlockUserModal';
import ProductDetailsModal from '../components/chat/ProductDetailsModal';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useContext(AppContext);

  // Conversations state
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState('conv-1');

  // Mobile View state ('list' | 'chat')
  const [mobileView, setMobileView] = useState('list');

  // Sidebar Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Blocked users set/dictionary
  const [blockedUserIds, setBlockedUserIds] = useState({});

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Handle URL query param: e.g. /messages?productId=prod-101
  useEffect(() => {
    const paramProdId = searchParams.get('productId');
    const paramSeller = searchParams.get('seller');

    if (paramProdId) {
      // Find existing conversation with this product or create a new inquiry conversation
      const existing = conversations.find(c => c.product.id === paramProdId);
      if (existing) {
        setActiveConversationId(existing.id);
        setMobileView('chat');
      } else {
        const foundProduct = PRODUCTS.find(p => p.id === paramProdId) || PRODUCTS[0];
        const newConv = {
          id: `conv-new-${Date.now()}`,
          partner: {
            id: `usr-${Date.now()}`,
            name: paramSeller || foundProduct.seller || "NexCart Seller",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
            role: "Seller",
            rating: 4.9,
            reviewCount: 24,
            verified: true,
            online: true,
            lastSeen: "Online now",
            location: "Metro City"
          },
          product: {
            id: foundProduct.id,
            title: foundProduct.title,
            price: foundProduct.price,
            originalPrice: foundProduct.originalPrice || foundProduct.price * 1.15,
            image: foundProduct.image,
            category: foundProduct.category,
            condition: "Like New",
            status: "Available"
          },
          unreadCount: 0,
          lastMessageTimestamp: "Just now",
          messages: [
            {
              id: `msg-auto-${Date.now()}`,
              senderId: "system",
              type: "system",
              text: `Product inquiry started for ${foundProduct.title}`
            },
            {
              id: `msg-inq-${Date.now()}`,
              senderId: "current-user",
              type: "text",
              text: `Hi! I'm interested in buying your ${foundProduct.title}. Is it available?`,
              timestamp: "Just now",
              status: "read"
            }
          ]
        };

        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        setMobileView('chat');
      }
    }
  }, [searchParams]);

  // Retrieve current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || conversations[0];
  }, [conversations, activeConversationId]);

  // Select conversation handler
  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    setMobileView('chat');

    // Clear unread count for this conversation
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
    );
  };

  // Send Message handler
  const handleSendMessage = (msgData) => {
    if (!activeConversation) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      ...msgData
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            lastMessageTimestamp: newMsg.timestamp,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );
  };

  // Accept Offer handler
  const handleAcceptOffer = (msgId, amount) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversation.id) {
          const updatedMessages = c.messages.map(m => {
            if (m.id === msgId && m.offerDetails) {
              return {
                ...m,
                offerDetails: { ...m.offerDetails, status: 'accepted' }
              };
            }
            return m;
          });

          // Append system notification message
          const systemMsg = {
            id: `sys-acc-${Date.now()}`,
            senderId: 'system',
            type: 'system',
            text: `🎉 Price Offer of $${amount} accepted! Proceed to schedule a meetup.`
          };

          return {
            ...c,
            product: { ...c.product, status: 'Offer Accepted' },
            messages: [...updatedMessages, systemMsg]
          };
        }
        return c;
      })
    );

    showToast(`Price offer of $${amount} accepted successfully!`, 'success');
  };

  // Decline Offer handler
  const handleDeclineOffer = (msgId) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversation.id) {
          const updatedMessages = c.messages.map(m => {
            if (m.id === msgId && m.offerDetails) {
              return {
                ...m,
                offerDetails: { ...m.offerDetails, status: 'declined' }
              };
            }
            return m;
          });
          return { ...c, messages: updatedMessages };
        }
        return c;
      })
    );

    showToast('Price offer declined.', 'info');
  };

  // Submit Offer Modal Callback
  const handleSubmitOffer = (amount, note) => {
    handleSendMessage({
      type: 'offer',
      offerDetails: {
        id: `off-${Date.now()}`,
        amount,
        originalPrice: activeConversation.product.price,
        status: 'pending',
        proposedBy: 'current-user'
      },
      text: note ? `Price Offer: $${amount}. Note: "${note}"` : `Submitted a price offer of $${amount}.00`
    });

    showToast(`Offer of $${amount} sent to ${activeConversation.partner.name}!`, 'success');
  };

  // Submit Meetup Modal Callback
  const handleSubmitMeetup = (meetupInfo) => {
    handleSendMessage({
      type: 'meetup',
      meetupDetails: {
        date: meetupInfo.date,
        time: meetupInfo.time,
        location: meetupInfo.location,
        status: 'pending'
      },
      text: `Proposed Meetup: ${meetupInfo.date} at ${meetupInfo.time}`
    });

    showToast('Meetup schedule proposal sent!', 'success');
  };

  // Confirm Meetup Callback
  const handleConfirmMeetup = (msgId) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversation.id) {
          const updatedMessages = c.messages.map(m => {
            if (m.id === msgId && m.meetupDetails) {
              return {
                ...m,
                meetupDetails: { ...m.meetupDetails, status: 'confirmed' }
              };
            }
            return m;
          });
          return { ...c, messages: updatedMessages };
        }
        return c;
      })
    );

    showToast('Meetup location & time confirmed!', 'success');
  };

  // Submit Location Callback
  const handleShareLocation = (locData) => {
    handleSendMessage({
      type: 'location',
      locationDetails: locData,
      text: `Shared Location: ${locData.title}`
    });

    showToast('Location card shared in chat!', 'success');
  };

  // Submit Report Callback
  const handleSubmitReport = (reportData) => {
    showToast(`Report for ${reportData.partnerName} submitted to NexCart Safety Team.`, 'info');
  };

  // Confirm Block Callback
  const handleConfirmBlock = (shouldBlock) => {
    if (!activeConversation) return;
    const partnerId = activeConversation.partner.id;
    setBlockedUserIds(prev => ({
      ...prev,
      [partnerId]: shouldBlock
    }));

    showToast(
      shouldBlock
        ? `${activeConversation.partner.name} has been blocked.`
        : `${activeConversation.partner.name} has been unblocked.`,
      shouldBlock ? 'error' : 'success'
    );
  };

  // Clear Chat History Callback
  const handleClearChat = () => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConversation.id) {
          return { ...c, messages: [] };
        }
        return c;
      })
    );
    showToast('Chat history cleared.', 'info');
  };

  const isCurrentBlocked = activeConversation
    ? !!blockedUserIds[activeConversation.partner.id]
    : false;

  return (
    <div className="w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] max-w-[1440px] mx-auto rounded-3xl overflow-hidden glass-card shadow-2xl border border-gray-200/80 dark:border-white/10 flex relative">
      
      {/* 1. Left Sidebar: Conversation List (Desktop always visible, Mobile conditionally visible) */}
      <div className={`w-full md:w-[380px] lg:w-[420px] h-full flex-shrink-0 ${
        mobileView === 'chat' ? 'hidden md:block' : 'block'
      }`}>
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      </div>

      {/* 2. Right Panel: Active Chat Window (Desktop always visible, Mobile conditionally visible) */}
      <div className={`flex-1 h-full min-w-0 ${
        mobileView === 'list' ? 'hidden md:block' : 'block'
      }`}>
        <ChatWindow
          conversation={activeConversation}
          onBack={() => setMobileView('list')}
          onSendMessage={handleSendMessage}
          onAcceptOffer={handleAcceptOffer}
          onDeclineOffer={handleDeclineOffer}
          onConfirmMeetup={handleConfirmMeetup}
          onOpenOfferModal={() => setIsOfferModalOpen(true)}
          onOpenMeetupModal={() => setIsMeetupModalOpen(true)}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenBlockModal={() => setIsBlockModalOpen(true)}
          onOpenProductModal={() => setIsProductModalOpen(true)}
          onClearChat={handleClearChat}
          isBlocked={isCurrentBlocked}
        />
      </div>

      {/* 3. Interactive Marketplace Modals */}
      {activeConversation && (
        <>
          <OfferModal
            isOpen={isOfferModalOpen}
            onClose={() => setIsOfferModalOpen(false)}
            onSubmitOffer={handleSubmitOffer}
            product={activeConversation.product}
          />

          <ScheduleMeetupModal
            isOpen={isMeetupModalOpen}
            onClose={() => setIsMeetupModalOpen(false)}
            onSubmitMeetup={handleSubmitMeetup}
          />

          <ShareLocationModal
            isOpen={isLocationModalOpen}
            onClose={() => setIsLocationModalOpen(false)}
            onShareLocation={handleShareLocation}
          />

          <ReportUserModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            onSubmitReport={handleSubmitReport}
            partner={activeConversation.partner}
          />

          <BlockUserModal
            isOpen={isBlockModalOpen}
            onClose={() => setIsBlockModalOpen(false)}
            onConfirmBlock={handleConfirmBlock}
            partner={activeConversation.partner}
            isBlocked={isCurrentBlocked}
          />

          <ProductDetailsModal
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            product={activeConversation.product}
            partner={activeConversation.partner}
          />
        </>
      )}
    </div>
  );
};

export default Messages;
