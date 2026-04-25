const multer = require('multer');

const storage = multer.memoryStorage();

const allowedMime = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/xml',
  'text/xml',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB per file
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase();
    const extAllowed = ['.txt', '.md', '.csv', '.json', '.xml', '.pdf', '.png', '.jpg', '.jpeg', '.webp'].some((x) => ext.endsWith(x));
    if (allowedMime.has(file.mimetype) || extAllowed) return cb(null, true);
    return cb(new Error(`Unsupported file type: ${file.originalname}`));
  },
});

module.exports = upload;
