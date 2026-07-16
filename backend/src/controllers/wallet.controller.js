const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getWalletInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    const history = await Transaction.find({ 
      $or: [{ buyer: req.user._id }, { seller: req.user._id }] 
    })
      .populate('media', 'price')
      .sort('-createdAt');

    res.json({
      balance: user.walletBalance,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
