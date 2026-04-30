const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/registrationController');
const adminAuth = require('../middleware/adminAuth');

router.post('/',       ctrl.createRegistration);
router.get('/',        adminAuth, ctrl.getAllRegistrations);
router.delete('/:id',  adminAuth, ctrl.deleteRegistration);

module.exports = router;
