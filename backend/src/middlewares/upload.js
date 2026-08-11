import multer from 'multer';

// Memory storage keeps the file in memory as Buffer for Supabase stream upload
const storage = multer.memoryStorage();

// File filter for allowed extensions (images, pdfs, documents)
const fileFilter = (req, file, cb) => {
  const allowedPrefixes = ['image/'];
  const allowedExactTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const isImage = allowedPrefixes.some((prefix) => file.mimetype.startsWith(prefix));
  const isDocument = allowedExactTypes.includes(file.mimetype);

  if (isImage || isDocument) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Allowed formats: Images, PDF, Word documents, Text files'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit per attachment
  },
});
