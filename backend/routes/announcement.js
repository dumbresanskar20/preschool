const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/announcementController');
const adminAuth = require('../middleware/adminAuth');

router.post('/',      adminAuth, ctrl.createAnnouncement);
router.get('/',                  ctrl.getAllAnnouncements);   // public
router.put('/:id',    adminAuth, ctrl.updateAnnouncement);
router.delete('/:id', adminAuth, ctrl.deleteAnnouncement);

module.exports = router;
