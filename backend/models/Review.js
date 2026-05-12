const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  parentName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true, trim: true },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
