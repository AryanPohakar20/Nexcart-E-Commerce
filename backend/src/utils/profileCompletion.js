// profileCompletion.js - Helper utility to calculate user profile completion percentage (Phase 2A)

/**
 * Calculates profile completion percentage for a user based on populated fields.
 * @param {Object} user - User document or object
 * @returns {number} Percentage between 0 and 100
 */
export const calculateProfileCompletion = (user) => {
  if (!user) return 0;

  const fields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'avatar',
    'dob',
    'gender',
    'bio',
  ];

  let completed = 0;
  fields.forEach((field) => {
    if (user[field] || user.profilePicture || user.dateOfBirth) {
      completed++;
    }
  });

  return Math.round((completed / fields.length) * 100);
};

export default calculateProfileCompletion;
