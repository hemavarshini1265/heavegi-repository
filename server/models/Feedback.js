const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: Number, default: null },
    orderId: { type: Number, default: null },
    productId: { type: Number, default: null },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    type: { type: String, enum: ['product', 'delivery', 'support', 'general'], default: 'general' },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
