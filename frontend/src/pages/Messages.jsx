import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';

import chatService from '../services/chatService';
import socketService from '../services/socketService';

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
  const { user: currentUser } = useContext(AuthContext);

  // Conversations & Messages State from DB
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);

  // Loading States
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Mobile View State ('list' | 'chat')
  const [mobileView, setMobileView] = useState('list');

  // Sidebar Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Real-Time Partner Typing Indicator
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Blocked users set/dictionary
  const [blockedUserIds, setBlockedUserIds] = useState({});

  // Counter Offer Modal State
  const [counterTargetMsg, setCounterTargetMsg] = useState(null);

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const currentUserIdStr = currentUser?._id || currentUser?.id;

  // Helper to normalize message format for frontend components
  const formatMessage = useCallback((msg) => {
    const rawSenderId = msg.senderId?._id || msg.senderId;
    const isSelf = rawSenderId?.toString() === currentUserIdStr?.toString();
    const createdDate = msg.createdAt ? new Date(msg.createdAt) : new Date();

    return {
      id: msg._id || msg.id,
      senderId: isSelf ? 'current-user' : rawSenderId?.toString(),
      receiverId: msg.receiverId?._id || msg.receiverId,
      text: msg.message || msg.text || '',
      type: msg.messageType || msg.type || 'text',
      attachments: msg.attachments || [],
      imageUrl: msg.attachments?.[0]?.url || msg.imageUrl,
      offerDetails: msg.offerDetails ? {
        offerId: msg.offerDetails.offerId || msg.offerDetails.id,
        amount: msg.offerDetails.offerPrice || msg.offerDetails.amount,
        originalPrice: msg.offerDetails.originalPrice,
        status: msg.offerDetails.status || 'pending',
        proposedBy: msg.offerDetails.proposedBy?.toString() === currentUserIdStr?.toString() ? 'current-user' : msg.offerDetails.proposedBy,
      } : undefined,
      meetupDetails: msg.meetupDetails,
      locationDetails: msg.locationDetails,
      status: msg.status || 'sent',
      timestamp: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [currentUserIdStr]);

  // Helper to normalize conversation item for frontend components
  const formatConversation = useCallback((conv) => {
    const isConvBlocked = conv.isBlocked || false;
    const partnerData = conv.partner || {};
    const productData = conv.listingId || conv.productId || conv.product || {};

    return {
      id: conv._id || conv.id,
      partner: {
        id: partnerData._id || partnerData.id,
        name: partnerData.name || 'NexCart User',
        avatar: partnerData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        role: partnerData.role || 'User',
        rating: partnerData.rating || 5.0,
        reviewCount: partnerData.reviewCount || 12,
        verified: partnerData.verified ?? true,
        online: partnerData.online ?? false,
        lastSeen: partnerData.lastSeen || 'Offline',
        location: partnerData.location || 'Marketplace',
      },
      product: {
        id: productData._id || productData.id || 'prod-general',
        title: productData.title || 'Marketplace Item',
        price: productData.price || 0,
        originalPrice: productData.originalPrice || productData.price || 0,
        image: productData.image || 'https://images.unsplash.com/photo-1557821552-17105176677c?w=300&q=80',
        category: productData.category || 'General',
        condition: productData.condition || 'Available',
        status: productData.status || 'Available',
      },
      unreadCount: conv.unreadCount || 0,
      lastMessageTimestamp: conv.updatedAt
        ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
      messages: Array.isArray(conv.messages) ? conv.messages.map(formatMessage) : [],
      isBlocked: isConvBlocked,
    };
  }, [formatMessage]);

  // Load Conversations from Backend Database
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const res = await chatService.getConversations(activeFilter, searchQuery);
      if (res.success && Array.isArray(res.data)) {
        const formattedList = res.data.map(formatConversation);
        setConversations(formattedList);
        
        const urlConvId = searchParams.get('conversationId');
        if (urlConvId && formattedList.some(c => c.id === urlConvId)) {
          setActiveConversationId(urlConvId);
          setMobileView('chat');
        } else if (formattedList.length > 0 && !activeConversationId && !urlConvId) {
          setActiveConversationId(formattedList[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, [activeFilter, searchQuery, formatConversation, activeConversationId]);

  // Connect Socket.IO on mount & load conversations
  useEffect(() => {
    socketService.connect();
    fetchConversations();

    return () => {
      // Clean up socket disconnect on unmount if needed
    };
  }, [fetchConversations]);

  // Load messages when active conversation changes
  const fetchMessagesForConv = useCallback(async (convId) => {
    if (!convId) return;
    try {
      setLoadingMsgs(true);
      const res = await chatService.getMessages(convId, 1, 100);
      if (res.success && Array.isArray(res.data)) {
        const formattedMsgs = res.data.map(formatMessage);
        setActiveMessages(formattedMsgs);
        setConversations(prev =>
          prev.map(c => c.id === convId ? { ...c, messages: formattedMsgs, unreadCount: 0 } : c)
        );
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [formatMessage]);

  // Handle URL Query Params (e.g. /messages?productId=prod123&seller=sellerId)
  useEffect(() => {
    const paramConvId = searchParams.get('conversationId');
    if (paramConvId) {
      if (!loadingConvs && conversations.length > 0) {
        const exists = conversations.some(c => c.id === paramConvId);
        if (exists && activeConversationId !== paramConvId) {
          setActiveConversationId(paramConvId);
          setMobileView('chat');
        }
      }
      return; // Skip the B2C creation logic if we have conversationId
    }

    const paramProdId = searchParams.get('productId');
    const paramSellerId = searchParams.get('sellerId') || searchParams.get('seller');

    if (paramSellerId && paramSellerId !== currentUserIdStr) {
      chatService.createConversation(paramSellerId, paramProdId).then(res => {
        if (res.success && res.data) {
          const newConv = formatConversation(res.data);
          setConversations(prev => {
            const exists = prev.some(c => c.id === newConv.id);
            return exists ? prev : [newConv, ...prev];
          });
          setActiveConversationId(newConv.id);
          setMobileView('chat');
        }
      }).catch(err => {
        console.error('Error creating conversation from URL param:', err);
      });
    }
  }, [searchParams, currentUserIdStr, formatConversation, loadingConvs, conversations, activeConversationId]);

  // Real-Time Socket Event Listeners
  useEffect(() => {
    if (activeConversationId) {
      socketService.joinConversation(activeConversationId);
      socketService.markMessageSeen(activeConversationId);
      chatService.markAsRead(activeConversationId).catch(() => {});
    }

    // Listen: newConversation
    const handleNewConversation = (conv) => {
      const formatted = formatConversation(conv);
      setConversations(prev => {
        const exists = prev.some(c => c.id === formatted.id);
        if (exists) return prev;
        return [formatted, ...prev];
      });
    };

    // Listen: receiveMessage
    const handleReceiveMessage = (msg) => {
      const formatted = formatMessage(msg);
      if (msg.conversationId === activeConversationId) {
        setActiveMessages(prev => {
          const exists = prev.some(m => m.id === formatted.id);
          if (exists) return prev;
          return [...prev, formatted];
        });
        socketService.markMessageSeen(activeConversationId);
      }

      setConversations(prev =>
        prev.map(c => {
          if (c.id === msg.conversationId) {
            const updatedMsgs = c.id === activeConversationId
              ? [...c.messages.filter(m => m.id !== formatted.id), formatted]
              : [...c.messages.filter(m => m.id !== formatted.id), formatted];
            return {
              ...c,
              lastMessageTimestamp: formatted.timestamp,
              unreadCount: c.id === activeConversationId ? 0 : (c.unreadCount || 0) + 1,
              messages: updatedMsgs,
            };
          }
          return c;
        })
      );
    };

    // Listen: messageSeen
    const handleMessageSeen = ({ conversationId }) => {
      if (conversationId === activeConversationId) {
        setActiveMessages(prev =>
          prev.map(m => m.senderId === 'current-user' ? { ...m, status: 'read' } : m)
        );
      }
    };

    // Listen: typing & stopTyping
    const handleTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversationId && userId !== currentUserIdStr) {
        setIsPartnerTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId, userId }) => {
      if (conversationId === activeConversationId && userId !== currentUserIdStr) {
        setIsPartnerTyping(false);
      }
    };

    // Listen: userOnline & userOffline
    const handleUserOnline = ({ userId }) => {
      setConversations(prev =>
        prev.map(c => c.partner.id === userId ? { ...c, partner: { ...c.partner, online: true } } : c)
      );
    };

    const handleUserOffline = ({ userId }) => {
      setConversations(prev =>
        prev.map(c => c.partner.id === userId ? { ...c, partner: { ...c.partner, online: false } } : c)
      );
    };

    // Listen: offerUpdated
    const handleOfferUpdated = ({ conversationId, action, messageId, offerId, updatedOffer, systemMsg }) => {
      if (conversationId === activeConversationId) {
        setActiveMessages(prev => {
          const updated = prev.map(m => {
            if ((m.id === messageId || m.offerDetails?.offerId === offerId) && m.offerDetails) {
              return {
                ...m,
                offerDetails: {
                  ...m.offerDetails,
                  status: action === 'accept' ? 'accepted' : action === 'reject' ? 'declined' : 'countered',
                },
              };
            }
            return m;
          });

          if (systemMsg) {
            const formattedSys = formatMessage(systemMsg);
            return [...updated, formattedSys];
          }

          return updated;
        });
      }
    };

    socketService.on('newConversation', handleNewConversation);
    socketService.on('receiveMessage', handleReceiveMessage);
    socketService.on('messageSeen', handleMessageSeen);
    socketService.on('typing', handleTyping);
    socketService.on('stopTyping', handleStopTyping);
    socketService.on('userOnline', handleUserOnline);
    socketService.on('userOffline', handleUserOffline);
    socketService.on('offerUpdated', handleOfferUpdated);

    return () => {
      if (activeConversationId) {
        socketService.leaveConversation(activeConversationId);
      }
      socketService.off('newConversation', handleNewConversation);
      socketService.off('receiveMessage', handleReceiveMessage);
      socketService.off('messageSeen', handleMessageSeen);
      socketService.off('typing', handleTyping);
      socketService.off('stopTyping', handleStopTyping);
      socketService.off('userOnline', handleUserOnline);
      socketService.off('userOffline', handleUserOffline);
      socketService.off('offerUpdated', handleOfferUpdated);
    };
  }, [activeConversationId, currentUserIdStr, formatMessage, formatConversation]);

  // Retrieve current active conversation object combined with latest activeMessages
  const activeConversation = useMemo(() => {
    const conv = conversations.find(c => c.id === activeConversationId);
    if (!conv) return null;
    return {
      ...conv,
      messages: activeMessages.length > 0 ? activeMessages : conv.messages,
    };
  }, [conversations, activeConversationId, activeMessages]);

  // Select conversation handler
  const handleSelectConversation = (convId) => {
    setActiveConversationId(convId);
    setMobileView('chat');
    setIsPartnerTyping(false);
    fetchMessagesForConv(convId);
  };

  // Send Message handler (Socket with REST fallback)
  const handleSendMessage = (msgData) => {
    if (!activeConversation) return;

    const receiverId = activeConversation.partner.id;
    const tempId = `temp-${Date.now()}`;

    const payload = {
      conversationId: activeConversation.id,
      receiverId,
      message: msgData.text || '',
      messageType: msgData.type || 'text',
      attachments: msgData.imageUrl ? [{ url: msgData.imageUrl }] : [],
      locationDetails: msgData.locationDetails,
      offerDetails: msgData.offerDetails,
      meetupDetails: msgData.meetupDetails,
    };

    // Optimistically update UI
    const optimisticMsg = {
      id: tempId,
      senderId: 'current-user',
      receiverId,
      text: payload.message,
      type: payload.messageType,
      attachments: payload.attachments,
      imageUrl: payload.attachments[0]?.url,
      locationDetails: payload.locationDetails,
      offerDetails: payload.offerDetails,
      meetupDetails: payload.meetupDetails,
      status: 'sending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveMessages(prev => [...prev, optimisticMsg]);

    // Socket real-time send
    socketService.sendMessage(payload, (res) => {
      if (res?.error) {
        // Fallback to REST API if socket callback reports error
        chatService.sendMessage(payload).then(apiRes => {
          if (apiRes.success && apiRes.data) {
            const formatted = formatMessage(apiRes.data);
            setActiveMessages(prev => prev.map(m => m.id === tempId ? formatted : m));
          }
        }).catch(err => {
          showToast(err.message || 'Failed to send message', 'error');
          setActiveMessages(prev => prev.filter(m => m.id !== tempId));
        });
      } else if (res?.success && res.data) {
        // Socket success callback
        const formatted = formatMessage(res.data);
        setActiveMessages(prev => {
          const hasRealMsg = prev.some(m => m.id === formatted.id);
          if (hasRealMsg) {
             return prev.filter(m => m.id !== tempId);
          }
          return prev.map(m => m.id === tempId ? formatted : m);
        });
      }
    });
  };

  // Typing event handlers
  const handleTyping = () => {
    if (!activeConversation) return;
    socketService.emitTyping(activeConversation.id, activeConversation.partner.id);
  };

  const handleStopTyping = () => {
    if (!activeConversation) return;
    socketService.emitStopTyping(activeConversation.id, activeConversation.partner.id);
  };

  // Accept Offer Handler
  const handleAcceptOffer = async (msgId, amount, offerId) => {
    try {
      const res = await chatService.acceptOffer(offerId || msgId, msgId);
      if (res.success) {
        socketService.emitOfferAction({
          conversationId: activeConversation.id,
          action: 'accept',
          messageId: msgId,
          offerId,
          systemMsg: res.data?.systemMsg,
        });

        setActiveMessages(prev =>
          prev.map(m => m.id === msgId && m.offerDetails ? { ...m, offerDetails: { ...m.offerDetails, status: 'accepted' } } : m)
        );

        showToast(`Price offer of $${amount} accepted!`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept offer', 'error');
    }
  };

  // Decline Offer Handler
  const handleDeclineOffer = async (msgId, offerId) => {
    try {
      const res = await chatService.rejectOffer(offerId || msgId, msgId);
      if (res.success) {
        socketService.emitOfferAction({
          conversationId: activeConversation.id,
          action: 'reject',
          messageId: msgId,
          offerId,
        });

        setActiveMessages(prev =>
          prev.map(m => m.id === msgId && m.offerDetails ? { ...m, offerDetails: { ...m.offerDetails, status: 'declined' } } : m)
        );

        showToast('Price offer declined.', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to decline offer', 'error');
    }
  };

  // Trigger Counter Offer Modal
  const handleOpenCounterOffer = (message) => {
    setCounterTargetMsg(message);
    setIsOfferModalOpen(true);
  };

  // Submit Offer / Counter Offer Modal Callback
  const handleSubmitOffer = async (amount, note) => {
    if (!activeConversation) return;

    if (counterTargetMsg) {
      // Counter offer submission
      try {
        const res = await chatService.counterOffer(
          counterTargetMsg.offerDetails?.offerId || counterTargetMsg.id,
          counterTargetMsg.id,
          amount,
          note
        );
        if (res.success && res.data?.message) {
          const newMsgFormatted = formatMessage(res.data.message);
          setActiveMessages(prev => [...prev, newMsgFormatted]);
          socketService.emitOfferAction({
            conversationId: activeConversation.id,
            action: 'counter',
            messageId: counterTargetMsg.id,
            offerId: counterTargetMsg.offerDetails?.offerId,
          });
          showToast(`Counter offer of $${amount} sent!`, 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to submit counter offer', 'error');
      } finally {
        setCounterTargetMsg(null);
      }
    } else {
      // Initial offer submission
      try {
        const res = await chatService.createOffer({
          conversationId: activeConversation.id,
          sellerId: activeConversation.partner.id,
          productId: activeConversation.product.id !== 'prod-general' ? activeConversation.product.id : undefined,
          offerPrice: amount,
          originalPrice: activeConversation.product.price,
          note,
        });
        if (res.success && res.data?.message) {
          const newMsgFormatted = formatMessage(res.data.message);
          setActiveMessages(prev => [...prev, newMsgFormatted]);
          showToast(`Price offer of $${amount} sent!`, 'success');
        }
      } catch (err) {
        showToast(err.message || 'Failed to send offer', 'error');
      }
    }
  };

  // Submit Meetup Modal Callback
  const handleSubmitMeetup = (meetupInfo) => {
    handleSendMessage({
      type: 'meetup',
      meetupDetails: {
        date: meetupInfo.date,
        time: meetupInfo.time,
        location: meetupInfo.location,
        status: 'pending',
      },
      text: `Proposed Meetup: ${meetupInfo.date} at ${meetupInfo.time}`,
    });

    showToast('Meetup schedule proposal sent!', 'success');
  };

  // Confirm Meetup Callback
  const handleConfirmMeetup = (msgId) => {
    setActiveMessages(prev =>
      prev.map(m => m.id === msgId && m.meetupDetails ? { ...m, meetupDetails: { ...m.meetupDetails, status: 'confirmed' } } : m)
    );
    showToast('Meetup location & time confirmed!', 'success');
  };

  // Submit Location Callback
  const handleShareLocation = (locData) => {
    handleSendMessage({
      type: 'location',
      locationDetails: locData,
      text: `Shared Location: ${locData.title}`,
    });

    showToast('Location card shared in chat!', 'success');
  };

  // Submit Report Callback
  const handleSubmitReport = async (reportData) => {
    try {
      await chatService.reportUser({
        reportedUserId: activeConversation.partner.id,
        conversationId: activeConversation.id,
        reason: reportData.reason || 'General Misconduct',
        description: reportData.description || '',
      });
      showToast(`Report for ${activeConversation.partner.name} submitted to Safety Team.`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to submit report', 'error');
    }
  };

  // Confirm Block Callback
  const handleConfirmBlock = async (shouldBlock) => {
    if (!activeConversation) return;
    const partnerId = activeConversation.partner.id;
    try {
      const res = await chatService.blockUser(partnerId);
      const isBlockedNow = res.isBlocked;
      setBlockedUserIds(prev => ({
        ...prev,
        [partnerId]: isBlockedNow,
      }));
      setConversations(prev =>
        prev.map(c => c.partner.id === partnerId ? { ...c, isBlocked: isBlockedNow } : c)
      );
      showToast(
        isBlockedNow
          ? `${activeConversation.partner.name} has been blocked.`
          : `${activeConversation.partner.name} has been unblocked.`,
        isBlockedNow ? 'error' : 'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update block status', 'error');
    }
  };

  // Clear Chat History Callback
  const handleClearChat = () => {
    setActiveMessages([]);
    showToast('Chat view cleared.', 'info');
  };

  const isCurrentBlocked = activeConversation
    ? !!blockedUserIds[activeConversation.partner.id] || activeConversation.isBlocked
    : false;

  return (
    <div className="w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] max-w-[1440px] mx-auto rounded-3xl overflow-hidden glass-card shadow-2xl border border-gray-200/80 dark:border-white/10 flex relative">
      
      {/* 1. Left Sidebar: Conversation List */}
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

      {/* 2. Right Panel: Active Chat Window */}
      <div className={`flex-1 h-full min-w-0 ${
        mobileView === 'list' ? 'hidden md:block' : 'block'
      }`}>
        <ChatWindow
          conversation={activeConversation}
          isTyping={isPartnerTyping}
          onBack={() => setMobileView('list')}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          onAcceptOffer={handleAcceptOffer}
          onDeclineOffer={handleDeclineOffer}
          onCounterOffer={handleOpenCounterOffer}
          onConfirmMeetup={handleConfirmMeetup}
          onOpenOfferModal={() => { setCounterTargetMsg(null); setIsOfferModalOpen(true); }}
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
            onClose={() => { setIsOfferModalOpen(false); setCounterTargetMsg(null); }}
            onSubmitOffer={handleSubmitOffer}
            product={activeConversation.product}
            initialPrice={counterTargetMsg?.offerDetails?.amount}
            isCounter={!!counterTargetMsg}
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
