import multer from 'multer';

// Memory storage keeps the file in memory as Buffer for Supabase stream upload
const storage = multer.memoryStorage();

// ─── MIME type blocklist ──────────────────────────────────────────────────────
// Explicitly blocked types — executable, script, and archive formats.
const BLOCKED_MIME_TYPES = new Set([
  'image/svg+xml',          // SVG can contain <script> tags → stored XSS risk
  'application/x-sh',
  'application/x-csh',
  'application/x-bash',
  'text/javascript',
  'application/javascript',
  'application/x-javascript',
  'application/x-httpd-php',
  'application/x-php',
  'application/x-perl',
  'application/x-python-code',
  'application/x-executable',
  'application/x-elf',
  'application/x-msdownload',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdos-program',
]);

// ─── Allowed MIME type prefixes ───────────────────────────────────────────────
const ALLOWED_MIME_PREFIXES = ['image/']; // Covers jpeg, png, gif, webp, etc. (but NOT svg — blocked above)
const ALLOWED_EXACT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

// ─── File filter ──────────────────────────────────────────────────────────────
// SECURITY: MIME type from the browser is used for initial filtering only.
// SVG is explicitly blocked regardless of mimetype prefix to prevent stored XSS.
// Note: browser-provided MIME types can be spoofed. For high-security uploads,
// a server-side magic-byte check (e.g. file-type package) should be added.
const fileFilter = (req, file, cb) => {
  const mime = file.mimetype ? file.mimetype.toLowerCase() : '';

  // Block SVG and other dangerous types first, before any allow-list check
  if (BLOCKED_MIME_TYPES.has(mime)) {
    return cb(
      new Error(`File type '${mime}' is not allowed. SVG and executable files are prohibited.`),
      false
    );
  }

  const isImage    = ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
  const isDocument = ALLOWED_EXACT_TYPES.has(mime);

  if (isImage || isDocument) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Allowed formats: JPEG, PNG, GIF, WebP, PDF, Word documents, Text files'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit per attachment
    files: 10,                   // Max 10 files per request
  },
});
