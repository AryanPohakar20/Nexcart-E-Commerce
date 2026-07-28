import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const allowedFields = [
  'fullName',
  'username',
  'mobile',
  'profilePicture',
  'dateOfBirth',
  'gender',
  'bio',
];

const calculateProfileCompletion = (user) => {
  const fields = [
    'fullName',
    'username',
    'email',
    'mobile',
    'profilePicture',
    'dateOfBirth',
    'gender',
    'bio',
    'emailVerified',
    'phoneVerified',
  ];

  let completed = 0;

  fields.forEach((field) => {
    const value = user[field];

    if (typeof value === 'boolean') {
      if (value) completed += 1;
      return;
    }

    if (typeof value === 'string') {
      if (value.trim().length > 0) completed += 1;
      return;
    }

    if (value instanceof Date) {
      if (!Number.isNaN(value.getTime())) completed += 1;
      return;
    }

    if (value !== null && value !== undefined) {
      completed += 1;
    }
  });

  return Math.round((completed / fields.length) * 100);
};

export const getProfileService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

export const updateProfileService = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const hasSupportedField = Object.keys(updateData || {}).some((key) => allowedFields.includes(key));

  if (!hasSupportedField) {
    throw new ApiError(400, 'No valid profile fields provided');
  }

  const payload = {};

  allowedFields.forEach((field) => {
    if (!Object.prototype.hasOwnProperty.call(updateData, field)) {
      return;
    }

    let value = updateData[field];

    if (value === null || value === undefined) {
      payload[field] = null;
      return;
    }

    if (field === 'fullName') {
      payload[field] = typeof value === 'string' ? value.trim() : value;
      return;
    }

    if (field === 'username') {
      payload[field] = typeof value === 'string' ? value.trim().toLowerCase() : value;
      return;
    }

    if (field === 'mobile') {
      payload[field] = typeof value === 'string' ? value.trim() : value;
      return;
    }

    if (field === 'profilePicture') {
      payload[field] = typeof value === 'string' ? value.trim() : value;
      return;
    }

    if (field === 'bio') {
      payload[field] = typeof value === 'string' ? value.trim() : value;
      return;
    }

    payload[field] = value;
  });

  if (payload.username) {
    const existingUser = await User.findOne({
      username: payload.username,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(409, 'Username is already taken');
    }
  }

  if (payload.mobile) {
    const existingUser = await User.findOne({
      mobile: payload.mobile,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(409, 'Mobile number is already in use');
    }
  }

  Object.assign(user, payload);
  user.profileCompletion = calculateProfileCompletion(user);
  await user.save();

  return user;
};
