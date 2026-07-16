const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'deposit'],
    default: 'purchase'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
