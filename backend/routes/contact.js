const express = require('express');
const router = express.Router();
const { submitContact, getContacts, deleteContact } = require('../controllers/contactController');
const adminAuth = require('../middleware/adminAuth');

router.post('/', submitContact);
router.get('/', adminAuth, getContacts);
router.delete('/:id', adminAuth, deleteContact);

module.exports = router;
