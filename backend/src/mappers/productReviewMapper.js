/**
 * Map raw review document to frontend DTO, removing sensitive details and internal database references.
 */
export const toReviewDTO = (review) => {
  if (!review) return null;

  const customer = review.customerId || {};
  
  // Construct a user-friendly reviewer name
  const reviewerName = customer.firstName && customer.lastName
    ? `${customer.firstName} ${customer.lastName}`
    : (customer.username || 'Anonymous');

  return {
    id: review._id.toString(),
    reviewerName,
    reviewerProfileImage: customer.avatar || null,
    rating: review.rating,
    comment: review.comment || '',
    images: review.images || [],
    createdAt: review.createdAt,
  };
};

/**
 * Map an array of raw reviews to frontend DTOs.
 */
export const toReviewDTOList = (reviews) => {
  if (!Array.isArray(reviews)) return [];
  return reviews.map(toReviewDTO).filter(Boolean);
};
