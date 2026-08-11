import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { AppContext } from '../../context/AppContext';
import SellerBadge from '../../components/seller/SellerBadge';
import { getSellerDisplayName, getSellerAvatar } from '../../utils/sellerHelpers';
import { 
  FiUser, FiStar, FiShield, FiCheckCircle, FiMapPin, 
  FiCalendar, FiMessageSquare, FiPackage, FiClock, FiEdit3, FiAward,
  FiBriefcase, FiDollarSign, FiUsers, FiEye
} from 'react-icons/fi';

const SAMPLE_REVIEWS = [
  {
    id: 1,
    buyerName: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    rating: 5,
    date: '2 days ago',
    comment: 'Super fast handoff! The iPhone was in absolutely mint condition as advertised, came with the original invoice and box.',
    productTitle: 'Apple iPhone 13 (128GB, Midnight)',
    type: 'C2C Verified Purchase',
  },
  {
    id: 2,
    buyerName: 'Sneha Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    date: '1 week ago',
    comment: 'Amazing packaging! The ceramic coffee mugs arrived without a single scratch. Excellent small boutique store.',
    productTitle: 'Minimalist Ceramic Coffee Mug Set',
    type: 'Retail Store Order',
  },
];

const SellerProfile = () => {
  const { settings, stats, user } = useContext(SellerContext);
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const isBusiness = settings.sellerType === 'business';
  const displayName = getSellerDisplayName({ accountInfo: { displayName: settings.displayName }, profile: { shopName: settings.businessName }, sellerType: settings.sellerType });
  const avatar = getSellerAvatar({ profile: { logo: { url: settings.avatar } }, userId: { avatar: user?.avatar } });

  const [bioText, setBioText] = useState(
    settings.bio || (isBusiness 
      ? 'Premium boutique lifestyle essentials and commercial inventory.'
      : 'Passionate tech enthusiast and certified marketplace merchant.')
  );

  return (
    <div className="space-y-8 text-left max-w-5xl">
      {/* ── 1. Profile Hero Card ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-cardBg to-secondaryBg border border-borderColor rounded-3xl p-6 md:p-8 space-y-6 shadow-card-hover">
        {/* Banner Cover Glow */}
        {isBusiness && (
           <div className="absolute inset-0 h-32 bg-gradient-to-r from-accentBlue/20 via-primary/20 to-accentBlue/20 pointer-events-none" />
        )}
        {!isBusiness && (
           <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accentBlue/10 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={avatar}
                alt={displayName}
                className={`w-20 h-20 md:w-24 md:h-24 object-cover border-2 shadow-yellow-glow ${isBusiness ? 'rounded-xl border-accentBlue' : 'rounded-full border-primary'}`}
              />
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-primary text-black font-black">
                <FiCheckCircle size={14} />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight">
                  {displayName}
                </h1>
                <SellerBadge sellerType={settings.sellerType} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-textSecondary mt-2">
                {isBusiness && settings.businessCategory && (
                  <span className="flex items-center gap-1.5 text-accentBlue font-bold">
                    <FiBriefcase />
                    <span>{settings.businessCategory}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="text-primary" />
                  <span>{settings.city || 'Bengaluru'}, {settings.state || 'Karnataka'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="text-accentBlue" />
                  <span>Joined Oct 2023</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface border border-borderColor px-4 py-3 rounded-2xl">
            <FiStar className="text-primary fill-primary" size={24} />
            <div>
              <div className="text-lg font-black text-textPrimary flex items-baseline gap-1">
                <span>4.9</span>
                <span className="text-xs text-textSecondary font-semibold">/ 5.0</span>
              </div>
              <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                142 Ratings
              </span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="relative z-10 pt-4 border-t border-borderColor space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">
              {isBusiness ? 'Business Description' : 'About Me'}
            </span>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
            >
              <FiEdit3 size={12} />
              <span>{isEditingBio ? 'Done Editing' : 'Edit Description'}</span>
            </button>
          </div>

          {isEditingBio ? (
            <textarea
              rows={3}
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              className="w-full bg-surface border border-borderColor rounded-xl p-3 text-textPrimary text-xs focus:outline-none focus:border-primary"
            />
          ) : (
            <p className="text-textSecondary text-xs leading-relaxed font-medium">
              {bioText}
            </p>
          )}

          {/* Business Only Info */}
          {isBusiness && (
            <div className="pt-3 flex flex-wrap gap-4 text-[11px]">
              {settings.gst && (
                <span className="flex items-center gap-1 text-textSecondary">
                  <FiShield className="text-emerald-600 dark:text-emerald-400" /> GST: <strong className="text-textPrimary">{settings.gst}</strong>
                </span>
              )}
              {settings.ownerName && (
                <span className="flex items-center gap-1 text-textSecondary">
                  <FiUser className="text-accentBlue" /> Owner: <strong className="text-textPrimary">{settings.ownerName}</strong>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Statistics Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          <FiPackage className="mx-auto text-primary mb-2" size={20} />
          <div className="text-xl font-black text-textPrimary">{stats?.activeListings || 24}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">
            {isBusiness ? 'Products Listed' : 'Listings'}
          </div>
        </div>
        
        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          <FiCheckCircle className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={20} />
          <div className="text-xl font-black text-textPrimary">{stats?.ordersCount || 142}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">
            {isBusiness ? 'Orders Completed' : 'Products Sold'}
          </div>
        </div>
        
        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          {isBusiness ? (
            <FiDollarSign className="mx-auto text-yellow-500 mb-2" size={20} />
          ) : (
            <FiEye className="mx-auto text-yellow-500 mb-2" size={20} />
          )}
          <div className="text-xl font-black text-textPrimary">
            {isBusiness ? formatCurrency(stats?.totalRevenue || 124000) : '4.2k'}
          </div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">
            {isBusiness ? 'Revenue' : 'Profile Views'}
          </div>
        </div>
        
        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          <FiUsers className="mx-auto text-accentBlue mb-2" size={20} />
          <div className="text-xl font-black text-textPrimary">890</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">Followers</div>
        </div>
      </div>

      {/* ── 3. Trust & Merchant Scorecard ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-cardBg border border-borderColor p-5 rounded-3xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <FiClock />
            <span>On-Time Fulfillment</span>
          </div>
          <div className="text-2xl font-black text-textPrimary mt-1">99.4%</div>
          <p className="text-[11px] text-textSecondary">All orders packed and shipped within 24h</p>
        </div>

        <div className="bg-cardBg border border-borderColor p-5 rounded-3xl space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <FiMessageSquare />
            <span>Buyer Response Rate</span>
          </div>
          <div className="text-2xl font-black text-textPrimary mt-1">&lt; 15 Mins</div>
          <p className="text-[11px] text-textSecondary">Instant answers to condition inquiries</p>
        </div>

        <div className="bg-cardBg border border-borderColor p-5 rounded-3xl space-y-1">
          <div className="flex items-center gap-2 text-accentBlue font-bold text-xs uppercase tracking-wider">
            <FiAward />
            <span>Verification Tier</span>
          </div>
          <div className="text-2xl font-black text-textPrimary mt-1">Tier 1 Gold</div>
          <p className="text-[11px] text-textSecondary">
            {isBusiness ? 'GST & Bank Account fully verified' : 'Aadhaar & Bank Account fully verified'}
          </p>
        </div>
      </div>

      {/* ── 4. Verified Customer Feedback & Reviews ────────────────────────── */}
      <div className="bg-cardBg border border-borderColor p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-borderColor pb-4">
          <div>
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <FiStar className="text-primary fill-primary" />
              <span>Verified Buyer Reviews</span>
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">Real feedback from completed marketplace orders</p>
          </div>
          <span className="text-xs text-primary font-bold">100% Positive Feedback</span>
        </div>

        <div className="divide-y divide-borderColor">
          {SAMPLE_REVIEWS.map((rev) => (
            <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={rev.avatar}
                    alt={rev.buyerName}
                    className="w-8 h-8 rounded-full object-cover border border-borderColor"
                  />
                  <div>
                    <h5 className="font-bold text-textPrimary text-xs">{rev.buyerName}</h5>
                    <span className="text-[10px] text-textSecondary">{rev.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={12} className="text-primary fill-primary" />
                  ))}
                </div>
              </div>

              <p className="text-textSecondary font-medium leading-relaxed pl-10">
                "{rev.comment}"
              </p>

              <div className="pl-10 flex items-center gap-2 text-[10px]">
                <span className="bg-surface text-textSecondary px-2 py-0.5 rounded-md font-medium border border-borderColor">
                  {rev.productTitle}
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                  {rev.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
