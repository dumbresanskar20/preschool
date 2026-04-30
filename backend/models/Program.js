const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  ageGroup:    { type: String, required: true, trim: true },
  image:       { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
