import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  if (process.env.MOCK_DB === 'true') {
    let token = '';
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    const saveMethod = async function() { return this; };

    if (token === 'mock_token_user') {
      req.user = {
        _id: 'mock_user_123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@example.com',
        phone: '1234567890',
        role: 'user',
        isVerified: true,
        save: saveMethod,
      };
    } else {
      req.user = {
        _id: 'mock_seller_123',
        firstName: 'Srushti',
        lastName: 'Salunke',
        username: 'srushti',
        email: 'srushtisalunke41@gmail.com',
        phone: '1234567890',
        role: 'seller',
        isVerified: false,
        save: saveMethod,
      };
    }
    return next();
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      throw new ApiError(401, 'User associated with this token no longer exists');
    }
    
    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized to access this route');
  }
});
