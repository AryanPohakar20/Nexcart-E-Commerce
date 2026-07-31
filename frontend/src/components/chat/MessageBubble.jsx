import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheck, FiCheckCircle, FiDollarSign, FiCalendar, FiMapPin, 
  FiCheckSquare, FiXCircle, FiClock, FiMaximize2, FiExternalLink, FiNavigation
} from 'react-icons/fi';

const MessageBubble = ({
  message,
  partner,
  product,
  onAcceptOffer,
  onDeclineOffer,
  onConfirmMeetup,
  onOpenLocation
}) => {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const isSent = message.senderId === 'current-user';

  // System Notification Bubble
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-white/10 px-3 py-1 rounded-full border border-gray-300/40 dark:border-white/5 shadow-xs">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col my-1.5 ${isSent ? 'items-end' : 'items-start'}`}>
      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%] group relative">
        
        {/* 1. Price Offer Message Card */}
        {message.type === 'offer' && (
          <div className={`p-4 rounded-3xl border shadow-md transition-all ${
            isSent 
              ? 'bg-gradient-to-br from-amber-500/20 via-primary/20 to-amber-600/10 border-primary/40 text-gray-900 dark:text-white rounded-br-sm'
              : 'bg-white dark:bg-[#1C1C1E] border-amber-500/30 text-gray-900 dark:text-white rounded-bl-sm'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
              <FiDollarSign className="text-base" /> Marketplace Price Offer
            </div>

            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5 mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Offered Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-primary">
                  ${message.offerDetails?.amount || product.price}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ${message.offerDetails?.originalPrice || product.price}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-700 dark:text-gray-300 mb-3 font-medium">
              {message.text}
            </p>

            {/* Offer Status & Interactive Actions */}
            {message.offerDetails?.status === 'pending' && !isSent && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onAcceptOffer(message.id, message.offerDetails?.amount)}
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  <FiCheckSquare className="text-sm" /> Accept Offer
                </button>
                <button
                  onClick={() => onDeclineOffer(message.id)}
                  className="flex-1 py-2 px-3 bg-gray-200 dark:bg-white/10 hover:bg-red-500 hover:text-white text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                >
                  <FiXCircle className="text-sm" /> Decline
                </button>
              </div>
            )}

            {message.offerDetails?.status === 'accepted' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold">
                <FiCheckCircle className="text-sm" /> Offer Accepted
              </div>
            )}

            {message.offerDetails?.status === 'declined' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 text-red-500 border border-red-500/20 text-xs font-bold">
                <FiXCircle className="text-sm" /> Offer Declined
              </div>
            )}
          </div>
        )}

        {/* 2. Meetup Schedule Card */}
        {message.type === 'meetup' && (
          <div className={`p-4 rounded-3xl border shadow-md ${
            isSent
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-gray-900 dark:text-white rounded-br-sm'
              : 'bg-white dark:bg-[#1C1C1E] border-emerald-500/30 text-gray-900 dark:text-white rounded-bl-sm'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">
              <FiCalendar className="text-base" /> Proposed Schedule Meetup
            </div>

            <div className="space-y-1.5 text-xs bg-black/5 dark:bg-white/5 p-3 rounded-2xl mb-3">
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-semibold">
                <FiClock className="text-emerald-500" />
                <span>{message.meetupDetails?.date} at {message.meetupDetails?.time}</span>
              </div>
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <FiMapPin className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{message.meetupDetails?.location}</span>
              </div>
            </div>

            {message.meetupDetails?.status === 'confirmed' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/20">
                <FiCheckCircle className="text-sm" /> Meetup Confirmed
              </span>
            ) : (
              !isSent && (
                <button
                  onClick={() => onConfirmMeetup(message.id)}
                  className="w-full py-2 px-3 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <FiCheckSquare className="text-sm" /> Confirm Meetup
                </button>
              )
            )}
          </div>
        )}

        {/* 3. Location Message Card */}
        {message.type === 'location' && (
          <div className={`p-3.5 rounded-3xl border shadow-md ${
            isSent
              ? 'bg-gradient-to-br from-accentBlue/20 to-blue-600/10 border-accentBlue/30 text-gray-900 dark:text-white rounded-br-sm'
              : 'bg-white dark:bg-[#1C1C1E] border-accentBlue/30 text-gray-900 dark:text-white rounded-bl-sm'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold text-accentBlue uppercase tracking-wider mb-2">
              <FiMapPin className="text-base" /> Safe Meetup Spot Shared
            </div>

            <div className="bg-accentBlue/10 p-3 rounded-2xl border border-accentBlue/20 mb-2">
              <h5 className="font-bold text-xs text-gray-900 dark:text-white mb-0.5">
                {message.locationDetails?.title}
              </h5>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                {message.locationDetails?.address}
              </p>
            </div>

            <button
              onClick={() => onOpenLocation && onOpenLocation(message.locationDetails)}
              className="w-full py-1.5 px-3 bg-accentBlue text-black font-bold text-xs rounded-xl hover:bg-accentBlue/90 transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <FiNavigation className="text-xs" /> Open Directions
            </button>
          </div>
        )}

        {/* 4. Image Attachment Message */}
        {message.type === 'image' && (
          <div className={`p-1.5 rounded-3xl border shadow-sm ${
            isSent
              ? 'bg-primary text-black rounded-br-sm border-primary/50'
              : 'bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white rounded-bl-sm border-gray-200 dark:border-white/10'
          }`}>
            <div className="relative group/img overflow-hidden rounded-2xl cursor-pointer" onClick={() => setIsImageZoomed(true)}>
              <img
                src={message.imageUrl}
                alt="attachment"
                className="w-full max-w-xs max-h-60 object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-xs gap-1">
                <FiMaximize2 className="text-base" /> Expand Image
              </div>
            </div>
            {message.text && (
              <p className="px-3 py-1 text-xs font-medium">{message.text}</p>
            )}
          </div>
        )}

        {/* 5. Standard Text Message */}
        {message.type === 'text' && (
          <div className={`px-4 py-2.5 rounded-3xl text-xs sm:text-sm font-normal shadow-sm leading-relaxed ${
            isSent
              ? 'bg-primary text-black font-medium rounded-br-sm shadow-amber-500/10'
              : 'bg-white dark:bg-[#1C1C1E] text-gray-900 dark:text-white border border-gray-200/80 dark:border-white/10 rounded-bl-sm'
          }`}>
            {message.text}
          </div>
        )}

        {/* Footer Timestamp & Read Receipt */}
        <div className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-gray-400 font-medium ${
          isSent ? 'justify-end' : 'justify-start'
        }`}>
          <span>{message.timestamp}</span>
          {isSent && (
            <span className="ml-0.5">
              {message.status === 'read' ? (
                <FiCheckCircle className="text-emerald-500 text-[11px] inline" />
              ) : (
                <FiCheck className="text-gray-400 text-[11px] inline" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {isImageZoomed && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl">
            <img src={message.imageUrl} alt="zoomed attachment" className="w-full h-full object-contain" />
            <button 
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-4 right-4 text-white bg-black/60 p-2 rounded-full font-bold text-xs"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
