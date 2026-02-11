const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary from env (required in production)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER || 'rentnest/properties',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    public_id: (req, file) => {
      const unique = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      return unique;
    }
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
    fileSize: parseInt(process.env.CLOUDINARY_MAX_FILE_SIZE, 10) || 3 * 1024 * 1024 // 3MB default
  }
});

/** Single image upload; field name: 'image'. Sets req.file.path = Cloudinary URL. */
exports.uploadSingleImage = upload.single('image');

/** Middleware: after upload, set req.body.image to the Cloudinary URL so create flow can use it. */
exports.applyUploadedImageUrl = (req, res, next) => {
  if (req.file && req.file.path) {
    req.body.image = req.file.path;
  }
  next();
};

/** Require Cloudinary env vars; call before upload. Returns 503 if not configured. */
exports.requireCloudinaryConfig = (req, res, next) => {
  if (cloudName && apiKey && apiSecret) return next();
  return res.status(503).json({
    success: false,
    message: 'Image upload not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
  });
};

/** Run upload + applyUploadedImageUrl only when Content-Type is multipart/form-data. */
exports.optionalMultipartImageUpload = (req, res, next) => {
  const isMultipart = req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data');
  if (!isMultipart) return next();
  exports.requireCloudinaryConfig(req, res, () => {
    upload.single('image')(req, res, (err) => {
      if (err) return next(err);
      exports.applyUploadedImageUrl(req, res, next);
    });
  });
};
