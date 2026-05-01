const Review = require('../models/Review');
const sendEmail = require('../config/mailer');

// POST /api/review
exports.createReview = async (req, res) => {
  try {
    const { parentName, email, rating, reviewText } = req.body;
    if (!parentName || !email || !rating || !reviewText) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }
    const review = await Review.create({ parentName, email, rating: Number(rating), reviewText, isApproved: false });

    console.log("DEBUG: Sending notification to school for review...");
    await sendEmail({
      to: 'bunnylandtalegaon@gmail.com',
      subject: `New Review Submitted by ${parentName}`,
      text: `Name: ${parentName}\nEmail: ${email}\nRating: ${rating}/5\nReview: ${reviewText}\n\nPlease review and approve from the admin dashboard.`,
      replyTo: email,
      fromName: 'Rainbow Website'
    });

    // Small delay to ensure Gmail handles sequential messages
    await new Promise(r => setTimeout(r, 1000));

    // Auto-reply to User
    console.log(`DEBUG: Sending auto-reply to user for review: ${email}`);
    const autoReplyRes = await sendEmail({
      to: email,
      subject: 'Review Received - Rainbow Preschool',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #f97316;">Hello ${parentName}!</h2>
          <p>Thank you for sharing your experience with <strong>Rainbow Preschool</strong>.</p>
          <p>We have successfully received your review. We deeply appreciate your feedback and support.</p>
          
          <div style="background: #fff8f0; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f97316;">
            <strong>Your Rating:</strong> ${rating} / 5 ⭐<br><br>
            <strong>Your Review:</strong><br>
            <i style="color: #555;">"${reviewText}"</i>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9rem; color: #666;">This is an automated response. Please do not reply directly to this email.</p>
          <p style="font-weight: bold; color: #f97316;">Best Regards,<br>Rainbow Preschool Team</p>
        </div>
      `,
      text: `Hello ${parentName},\n\nThank you for sharing your experience with Rainbow Preschool. We have successfully received your review and deeply appreciate your feedback.\n\nYour Rating: ${rating} / 5\nYour Review: "${reviewText}"`
    });

    if (!autoReplyRes.success) {
      console.warn(`Email delivery for review auto-reply failed: ${autoReplyRes.error || 'Unknown Error'}`);
    }

    res.status(201).json({ success: true, message: 'Review submitted successfully!', data: review });
  } catch (err) {
    console.error('❌ Review API Error:', err);
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/review  (approved only — public)
exports.getApprovedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/review/all  (admin — all reviews)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/review/:id  (approve / reject toggle)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: `Review ${isApproved ? 'approved' : 'rejected'}.`, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/review/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
