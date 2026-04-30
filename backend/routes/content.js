const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/contentController');
const adminAuth = require('../middleware/adminAuth');

router.get('/',  ctrl.getContent);               // public
router.put('/',  adminAuth, ctrl.updateContent); // admin only

module.exports = router;
