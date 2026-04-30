const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  aboutText:      { type: String, default: 'At Rainbow Preschool, we believe every child is a unique spectrum of potential. Our Bunnyland campus provides a safe, stimulating, and inclusive environment where play is the primary language of learning.' },
  contactEmail:   { type: String, default: 'rupalimurhe11031612@gmail.com' },
  phoneNumber:    { type: String, default: '07083350502' },
  address:        { type: String, default: 'Plot no. 14A /1 Rainbow Preschool, Behind Lion\'s Health Club, Kadolkar colony, Talegaon Dabhade, Pune, India, 410506' },
  schoolTimings:  { type: String, default: 'Mon–Fri: 10 AM – 2 PM' },
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
