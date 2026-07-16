const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth to prevent brute force (Bonus Requirement)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;
