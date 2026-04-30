const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/reviewController');
const adminAuth = require('../middleware/adminAuth');

router.post('/',       ctrl.createReview);          // public — submit review
router.get('/',        ctrl.getApprovedReviews);    // public — approved only
router.get('/all',     adminAuth, ctrl.getAllReviews);        // admin — all
router.put('/:id',     adminAuth, ctrl.updateReviewStatus);   // admin — approve/reject
router.delete('/:id',  adminAuth, ctrl.deleteReview);         // admin — delete

module.exports = router;
