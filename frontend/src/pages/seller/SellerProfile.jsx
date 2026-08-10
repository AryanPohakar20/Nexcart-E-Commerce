import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SellerContext } from '../../context/SellerContext';
import { AppContext } from '../../context/AppContext';
import publicProfileService from '../../services/publicProfileService';
import profileService from '../../services/profileService';
import SellerBadge from '../../components/seller/SellerBadge';
import ProductCard from '../../components/ProductCard';
import { 
  FiUser, FiStar, FiShield, FiCheckCircle, FiMapPin, 
  FiCalendar, FiMessageSquare, FiPackage, FiClock, FiEdit3, FiAward,
  FiBriefcase, FiDollarSign, FiUsers, FiEye, FiUserPlus, FiUserCheck,
  FiRefreshCw, FiAlertTriangle, FiShoppingBag, FiSend, FiX
} from 'react-icons/fi';

const SellerProfile = () => {
  const { userId, id, slug } = useParams();
  const navigate = useNavigate();

  const { user: sellerCtxUser, settings: sellerCtxSettings } = useContext(SellerContext) || {};
  const { user: appUser, showToast } = useContext(AppContext) || {};

  const currentUser = appUser || sellerCtxUser;
  
  // Resolve target identifier from URL parameters or fall back to logged-in user
  const targetIdentifier = userId || id || slug || currentUser?.seller?.sellerId || currentUser?.seller?._id || currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // Bio Edit State (Owner)
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewProductTitle, setNewReviewProductTitle] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // ─── Fetch Public Profile Data ─────────────────────────────────────────────
  const fetchProfileData = async () => {
    if (!targetIdentifier) {
      setIsNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const res = await publicProfileService.getPublicProfile(targetIdentifier);
      const data = res?.data?.seller || res?.data?.profile || res?.data;

      if (!data) {
        setIsNotFound(true);
      } else {
        setProfile(data);
        setIsFollowing(!!data.isFollowing);
        setBioText(data.bio || '');
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
      if (err?.statusCode === 404 || err?.status === 404 || err?.message?.includes('not found')) {
        setIsNotFound(true);
      } else {
        setError(err?.message || 'Failed to load profile details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [targetIdentifier]);

  // ─── Follow / Unfollow Toggle ──────────────────────────────────────────────
  const handleToggleFollow = async () => {
    if (!currentUser) {
      if (showToast) showToast('Please log in to follow this seller.', 'error');
      navigate('/login');
      return;
    }

    setIsTogglingFollow(true);
    try {
      const res = await publicProfileService.toggleFollow(targetIdentifier);
      if (res?.data) {
        setIsFollowing(res.data.isFollowing);
        setProfile((prev) => prev ? {
          ...prev,
          isFollowing: res.data.isFollowing,
          stats: {
            ...prev.stats,
            followers: res.data.followersCount,
          },
        } : prev);

        if (showToast) {
          showToast(res.data.isFollowing ? 'Following seller!' : 'Unfollowed seller.');
        }
      }
    } catch (err) {
      if (showToast) showToast(err?.message || 'Failed to update follow status', 'error');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  // ─── Save Bio (Owner Only) ────────────────────────────────────────────────
  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      await profileService.updateProfile({ bio: bioText.trim() });
      setProfile((prev) => prev ? { ...prev, bio: bioText.trim() } : prev);
      setIsEditingBio(false);
      if (showToast) showToast('Description updated successfully!');
    } catch (err) {
      if (showToast) showToast(err?.message || 'Failed to update description', 'error');
    } finally {
      setIsSavingBio(false);
    }
  };

  // ─── Contact / Message Seller ──────────────────────────────────────────────
  const handleMessageSeller = () => {
    if (!profile?.userId) return;
    navigate(`/messages?sellerId=${profile.userId}`);
  };

  // ─── Post Review ──────────────────────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) {
      if (showToast) showToast('Please write a review comment.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await publicProfileService.postReview(targetIdentifier, {
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        productTitle: newReviewProductTitle.trim() || 'Marketplace Item',
      });

      if (res?.data?.review) {
        setProfile((prev) => prev ? {
          ...prev,
          reviews: [res.data.review, ...(prev.reviews || [])],
          stats: {
            ...prev.stats,
            totalReviews: (prev.stats?.totalReviews || 0) + 1,
          },
        } : prev);
        if (showToast) showToast('Review submitted successfully!');
        setIsReviewModalOpen(false);
        setNewReviewComment('');
        setNewReviewProductTitle('');
      }
    } catch (err) {
      if (showToast) showToast(err?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ─── 1. Loading Skeleton State ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 text-left max-w-5xl animate-pulse">
        <div className="bg-cardBg border border-borderColor rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-surface rounded-full" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-surface rounded w-48" />
              <div className="h-4 bg-surface rounded w-64" />
            </div>
          </div>
          <div className="h-16 bg-surface rounded-2xl w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-cardBg border border-borderColor p-4 rounded-3xl h-24" />
          ))}
        </div>
      </div>
    );
  }

  // ─── 2. Profile Not Found State ───────────────────────────────────────────
  if (isNotFound) {
    return (
      <div className="bg-cardBg border border-borderColor rounded-3xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl">
          <FiAlertTriangle />
        </div>
        <h2 className="text-xl font-black text-textPrimary">Profile Not Found</h2>
        <p className="text-xs text-textSecondary leading-relaxed">
          The user or seller profile you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-glow-yellow px-6 py-2.5 rounded-xl text-xs font-bold text-black transition-all"
        >
          Return to Marketplace Home
        </button>
      </div>
    );
  }

  // ─── 3. Error State with Retry ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-cardBg border border-borderColor rounded-3xl p-8 text-center max-w-xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto text-2xl">
          <FiRefreshCw />
        </div>
        <h2 className="text-xl font-black text-textPrimary">Failed to Load Profile</h2>
        <p className="text-xs text-textSecondary leading-relaxed">{error}</p>
        <button
          onClick={fetchProfileData}
          className="bg-primary text-black px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
        >
          <FiRefreshCw />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const isBusiness = profile?.isBusiness || profile?.sellerType === 'business';
  const isOwnProfile = profile?.isOwnProfile || (currentUser?._id === profile?.userId);
  const locationString = profile?.city || profile?.state
    ? `${profile.city || ''}${profile.city && profile.state ? ', ' : ''}${profile.state || ''}`
    : 'Not provided';

  const formattedJoinDate = profile?.createdAt
    ? `Joined ${new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    : 'Joined recently';

  return (
    <div className="space-y-8 text-left max-w-5xl">
      {/* ── 1. Profile Hero Card ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-cardBg to-secondaryBg border border-borderColor rounded-3xl p-6 md:p-8 space-y-6 shadow-card-hover">
        {/* Banner Cover Glow */}
        {isBusiness ? (
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-accentBlue/20 via-primary/20 to-accentBlue/20 pointer-events-none" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accentBlue/10 pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-5">
            <div className="relative">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.displayName}
                  className={`w-20 h-20 md:w-24 md:h-24 object-cover border-2 shadow-yellow-glow ${
                    isBusiness ? 'rounded-xl border-accentBlue' : 'rounded-full border-primary'
                  }`}
                />
              ) : (
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 bg-surface border-2 flex items-center justify-center text-2xl font-black text-textPrimary ${
                    isBusiness ? 'rounded-xl border-accentBlue' : 'rounded-full border-primary'
                  }`}
                >
                  {profile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-primary text-black font-black" title={profile?.verificationStatus}>
                <FiCheckCircle size={14} />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-textPrimary tracking-tight">
                  {profile?.displayName || profile?.fullName || 'Marketplace Member'}
                </h1>
                <SellerBadge sellerType={profile?.sellerType} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-textSecondary mt-2">
                {isBusiness && profile?.businessCategory && (
                  <span className="flex items-center gap-1.5 text-accentBlue font-bold">
                    <FiBriefcase />
                    <span>{profile.businessCategory}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="text-primary" />
                  <span>{locationString}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="text-accentBlue" />
                  <span>{formattedJoinDate}</span>
                </span>
              </div>

              {/* Follow & Message Buttons (Visitor View) */}
              {!isOwnProfile && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleToggleFollow}
                    disabled={isTogglingFollow}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                      isFollowing
                        ? 'bg-surface border border-borderColor text-textPrimary hover:bg-surface/80'
                        : 'bg-primary text-black hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? <FiUserCheck size={14} /> : <FiUserPlus size={14} />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>

                  <button
                    onClick={handleMessageSeller}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-accentBlue/10 text-accentBlue border border-accentBlue/30 hover:bg-accentBlue/20 flex items-center gap-2 transition-all"
                  >
                    <FiMessageSquare size={14} />
                    <span>Message Seller</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface border border-borderColor px-4 py-3 rounded-2xl">
            <FiStar className="text-primary fill-primary" size={24} />
            <div>
              <div className="text-lg font-black text-textPrimary flex items-baseline gap-1">
                <span>{profile?.stats?.rating ? profile.stats.rating.toFixed(1) : '0.0'}</span>
                <span className="text-xs text-textSecondary font-semibold">/ 5.0</span>
              </div>
              <span className="text-[10px] text-textSecondary uppercase font-bold tracking-wider block">
                {profile?.stats?.totalReviews || 0} Ratings
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
            {isOwnProfile && (
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <FiEdit3 size={12} />
                <span>{isEditingBio ? 'Done Editing' : 'Edit Description'}</span>
              </button>
            )}
          </div>

          {isEditingBio ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                className="w-full bg-surface border border-borderColor rounded-xl p-3 text-textPrimary text-xs focus:outline-none focus:border-primary"
                placeholder="Write something about yourself or your business..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1.5 rounded-lg border border-borderColor text-xs text-textSecondary hover:text-textPrimary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  disabled={isSavingBio}
                  className="px-4 py-1.5 rounded-lg bg-primary text-black text-xs font-bold hover:opacity-90"
                >
                  {isSavingBio ? 'Saving...' : 'Save Description'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-textSecondary text-xs leading-relaxed font-medium">
              {profile?.bio || 'Not provided'}
            </p>
          )}

          {/* Business Only Info */}
          {isBusiness && (
            <div className="pt-3 flex flex-wrap gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-textSecondary">
                <FiShield className="text-emerald-600 dark:text-emerald-400" /> GST: <strong className="text-textPrimary">{profile?.gst || 'Not provided'}</strong>
              </span>
              <span className="flex items-center gap-1 text-textSecondary">
                <FiUser className="text-accentBlue" /> Owner: <strong className="text-textPrimary">{profile?.ownerName || 'Not provided'}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Statistics Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          <FiPackage className="mx-auto text-primary mb-2" size={20} />
          <div className="text-xl font-black text-textPrimary">{profile?.stats?.activeListings ?? 0}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">
            {isBusiness ? 'Products Listed' : 'Listings'}
          </div>
        </div>

        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          <FiCheckCircle className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" size={20} />
          <div className="text-xl font-black text-textPrimary">{profile?.stats?.ordersCount ?? 0}</div>
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
            {isBusiness
              ? `₹${(profile?.stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`
              : (profile?.stats?.profileViews ?? 0)}
          </div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">
            {isBusiness ? 'Revenue' : 'Profile Views'}
          </div>
        </div>

        <div className="bg-cardBg border border-borderColor p-4 rounded-3xl text-center space-y-1">
          <FiUsers className="mx-auto text-accentBlue mb-2" size={20} />
          <div className="text-xl font-black text-textPrimary">{profile?.stats?.followers ?? 0}</div>
          <div className="text-[10px] text-textSecondary uppercase tracking-wider font-bold">Followers</div>
        </div>
      </div>

      {/* ── 3. Real Seller Products Section ────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-textPrimary uppercase tracking-wider flex items-center gap-2">
            <FiShoppingBag className="text-primary" />
            <span>Active Products & Inventory ({profile?.products?.length || 0})</span>
          </h3>
        </div>

        {profile?.products && profile.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.products.map((prod) => (
              <ProductCard key={prod.id || prod._id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="bg-cardBg border border-borderColor p-8 rounded-3xl text-center space-y-2">
            <FiPackage className="mx-auto text-textSecondary" size={32} />
            <p className="text-xs text-textSecondary font-medium">No active products listed by this seller yet.</p>
          </div>
        )}
      </div>

      {/* ── 4. Trust & Merchant Scorecard ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-cardBg border border-borderColor p-5 rounded-3xl space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <FiClock />
            <span>On-Time Fulfillment</span>
          </div>
          <div className="text-2xl font-black text-textPrimary mt-1">
            {profile?.stats?.ordersCount > 0 ? '100%' : 'N/A'}
          </div>
          <p className="text-[11px] text-textSecondary">Orders packed and shipped promptly</p>
        </div>

        <div className="bg-cardBg border border-borderColor p-5 rounded-3xl space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <FiMessageSquare />
            <span>Buyer Response Rate</span>
          </div>
          <div className="text-2xl font-black text-textPrimary mt-1">&lt; 15 Mins</div>
          <p className="text-[11px] text-textSecondary">Fast response to condition inquiries</p>
        </div>

        <div className="bg-cardBg border border-borderColor p-5 rounded-3xl space-y-1">
          <div className="flex items-center gap-2 text-accentBlue font-bold text-xs uppercase tracking-wider">
            <FiAward />
            <span>Verification Tier</span>
          </div>
          <div className="text-2xl font-black text-textPrimary mt-1 capitalize">
            {profile?.verificationStatus === 'Verified' ? 'Verified Member' : 'Pending Verification'}
          </div>
          <p className="text-[11px] text-textSecondary">
            {isBusiness ? 'GST & Account details status' : 'Identity & Account details status'}
          </p>
        </div>
      </div>

      {/* ── 5. Customer Feedback & Reviews ────────────────────────── */}
      <div className="bg-cardBg border border-borderColor p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between border-b border-borderColor pb-4">
          <div>
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
              <FiStar className="text-primary fill-primary" />
              <span>Verified Buyer Reviews ({profile?.reviews?.length || 0})</span>
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">Real feedback from marketplace orders</p>
          </div>

          {!isOwnProfile && currentUser && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <FiEdit3 size={13} />
              <span>Write a Review</span>
            </button>
          )}
        </div>

        {profile?.reviews && profile.reviews.length > 0 ? (
          <div className="divide-y divide-borderColor">
            {profile.reviews.map((rev) => (
              <div key={rev.id || rev._id} className="py-4 first:pt-0 last:pb-0 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {rev.avatar ? (
                      <img
                        src={rev.avatar}
                        alt={rev.buyerName}
                        className="w-8 h-8 rounded-full object-cover border border-borderColor"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface border border-borderColor flex items-center justify-center font-bold text-textPrimary">
                        {rev.buyerName?.charAt(0) || 'B'}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-textPrimary text-xs">{rev.buyerName}</h5>
                      <span className="text-[10px] text-textSecondary">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={12}
                        className={i < rev.rating ? 'text-primary fill-primary' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-textSecondary font-medium leading-relaxed pl-10">
                  "{rev.comment}"
                </p>

                <div className="pl-10 flex items-center gap-2 text-[10px]">
                  <span className="bg-surface text-textSecondary px-2 py-0.5 rounded-md font-medium border border-borderColor">
                    {rev.productTitle || 'Marketplace Item'}
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                    {rev.type || 'Verified Purchase'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-textSecondary">
            No customer reviews yet for this seller.
          </div>
        )}
      </div>

      {/* ── 6. Write Review Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cardBg border border-borderColor rounded-3xl p-6 max-w-md w-full space-y-4 relative"
            >
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-textSecondary hover:text-textPrimary"
              >
                <FiX size={18} />
              </button>

              <h3 className="text-base font-bold text-textPrimary uppercase tracking-wider">
                Write a Seller Review
              </h3>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-textSecondary mb-1 uppercase tracking-wider">
                    Rating
                  </label>
                  <div className="flex items-center gap-2 text-xl text-primary">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="hover:scale-110 transition-transform"
                      >
                        <FiStar className={star <= newReviewRating ? 'fill-primary' : 'text-gray-600'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-textSecondary mb-1 uppercase tracking-wider">
                    Product Purchased (Optional)
                  </label>
                  <input
                    type="text"
                    value={newReviewProductTitle}
                    onChange={(e) => setNewReviewProductTitle(e.target.value)}
                    placeholder="e.g. Wireless Headphones"
                    className="w-full bg-surface border border-borderColor rounded-xl p-3 text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-textSecondary mb-1 uppercase tracking-wider">
                    Your Review Comment
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Share your experience with this seller..."
                    className="w-full bg-surface border border-borderColor rounded-xl p-3 text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-borderColor text-textSecondary hover:text-textPrimary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 rounded-xl bg-primary text-black font-bold hover:opacity-90 flex items-center gap-1.5"
                  >
                    <FiSend size={13} />
                    <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerProfile;
