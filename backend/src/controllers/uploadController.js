import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadAadhaarImage } from '../services/cloudinaryService.js';
import User from '../models/User.js';

export const uploadAadhaar = asyncHandler(async (req, res) => {
  const frontImageFile = req.files?.frontImage?.[0];
  const backImageFile = req.files?.backImage?.[0];

  if (!frontImageFile || !backImageFile) {
    throw new ApiError(400, 'Both front and back Aadhaar images are required');
  }

  // Upload to Cloudinary
  const [frontImageUpload, backImageUpload] = await Promise.all([
    uploadAadhaarImage(frontImageFile.buffer),
    uploadAadhaarImage(backImageFile.buffer),
  ]);

  // Update user with Aadhaar info
  await User.findByIdAndUpdate(
    req.user._id,
    {
      'aadhaar.frontImage': {
        public_id: frontImageUpload.public_id,
        url: frontImageUpload.secure_url,
      },
      'aadhaar.backImage': {
        public_id: backImageUpload.public_id,
        url: backImageUpload.secure_url,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Aadhaar uploaded successfully',
    data: {
      frontImage: frontImageUpload.secure_url,
      backImage: backImageUpload.secure_url,
    },
  });
});
