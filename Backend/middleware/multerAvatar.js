/**
 * Single avatar image upload to uploads/avatars/
 * Max size: AVATAR_MAX_FILE_SIZE (bytes), default 50MB. Example for 200MB: AVATAR_MAX_FILE_SIZE=209715200
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DEFAULT_AVATAR_MAX = 50 * 1024 * 1024; // 50MB

function parseAvatarMaxBytes() {
  const raw = process.env.AVATAR_MAX_FILE_SIZE;
  if (raw == null || raw === '') return DEFAULT_AVATAR_MAX;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1024 * 1024) return DEFAULT_AVATAR_MAX; // minimum 1MB if env is invalid
  return n;
}

const AVATAR_MAX_FILE_SIZE = parseAvatarMaxBytes();

function formatMaxLabel(bytes) {
  if (bytes >= 1024 ** 3) {
    const g = bytes / 1024 ** 3;
    return g >= 10 ? `${Math.round(g)} GB` : `${g.toFixed(1).replace(/\.0$/, '')} GB`;
  }
  if (bytes >= 1024 ** 2) {
    const m = bytes / 1024 ** 2;
    return m >= 10 ? `${Math.round(m)} MB` : `${Math.round(m * 10) / 10} MB`.replace(/\.0 MB$/, ' MB');
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function getAvatarMaxSizeMessage() {
  return `Image too large. Max ${formatMaxLabel(AVATAR_MAX_FILE_SIZE)}.`;
}

const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext.toLowerCase()}`;
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
    fileSize: AVATAR_MAX_FILE_SIZE
  }
});

exports.uploadAvatar = upload.single('image');
exports.AVATAR_MAX_FILE_SIZE = AVATAR_MAX_FILE_SIZE;
exports.getAvatarMaxSizeMessage = getAvatarMaxSizeMessage;
