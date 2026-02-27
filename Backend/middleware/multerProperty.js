/**
 * Multer config for local property image uploads.
 * Stores files in uploads/properties/
 * Max 5MB per image, images only.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/properties directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').slice(0, 50);
    const unique = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext.toLowerCase()}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|webp|gif)$/i;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

/** Multiple images; field name: 'images'. Max 10 images. */
exports.uploadPropertyImages = upload.array('images', 10);

/**
 * Run upload only when Content-Type is multipart/form-data.
 * After upload, sets req.body.image (first) and req.body.images (all URLs).
 */
exports.optionalPropertyImagesUpload = (req, res, next) => {
  const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
  if (!isMultipart) return next();

  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image too large. Max 5MB per file.' });
      }
      if (err.message?.includes('Only image files')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    // Build URLs: baseUrl/uploads/properties/filename
    const baseUrl = process.env.BASE_URL || (req.protocol + '://' + req.get('host'));
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(f => `${baseUrl}/uploads/properties/${f.filename}`);
      req.body.image = req.body.images[0];
    }
    next();
  });
};
