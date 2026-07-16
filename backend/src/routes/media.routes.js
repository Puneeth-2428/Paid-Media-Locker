const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth.middleware');
const { uploadMedia, getFeed, unlockMedia, getAccessUrl } = require('../controllers/media.controller');

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
router.post('/:id/unlock', protect, unlockMedia);
router.get('/:id/access', protect, getAccessUrl);

module.exports = router;
