const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalKey: {
    type: String,
    required: true
  },
  previewKey: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
