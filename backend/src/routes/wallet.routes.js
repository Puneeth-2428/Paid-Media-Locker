const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getWalletInfo } = require('../controllers/wallet.controller');

router.get('/', protect, getWalletInfo);

module.exports = router;
