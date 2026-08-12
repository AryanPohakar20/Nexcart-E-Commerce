/**
 * Map raw seller review document to DTO, removing sensitive details and internal database references.
 */
export const toSellerReviewDTO = (review) => {
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
    updatedAt: review.updatedAt,
  };
};

/**
 * Map an array of raw seller reviews to DTOs.
 */
export const toSellerReviewDTOList = (reviews) => {
  if (!Array.isArray(reviews)) return [];
  return reviews.map(toSellerReviewDTO).filter(Boolean);
};
