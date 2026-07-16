const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const { uploadMedia, getFeed, unlockMedia, getAccessUrl } = require('../controllers/media.controller');
const rateLimit = require('express-rate-limit');

const unlockLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many unlock attempts, please try again later.' }
});

// Use memory storage since we process with sharp before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

router.post('/upload', protect, upload.single('image'), uploadMedia);
router.get('/', protect, getFeed);
router.post('/:id/unlock', protect, unlockLimiter, unlockMedia);
router.get('/:id/access', protect, getAccessUrl);

module.exports = router;
