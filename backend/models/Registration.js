const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  parentName: { type: String, required: true, trim: true },
  childAge:   { type: String, required: true, trim: true },
  phone:      { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true },
  inquiryType:{ type: String, default: 'General Inquiry', trim: true },
  message:    { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
