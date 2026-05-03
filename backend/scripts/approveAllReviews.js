require('dotenv').config();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({ isApproved: Boolean }, { strict: false });
const Review = mongoose.model('Review', reviewSchema);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Review.updateMany({ isApproved: false }, { isApproved: true });
  console.log(`Updated ${result.modifiedCount} reviews to isApproved: true`);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
