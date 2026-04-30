const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/programController');
const adminAuth = require('../middleware/adminAuth');

router.post('/',      adminAuth, ctrl.createProgram);
router.get('/',                  ctrl.getAllPrograms);   // public
router.put('/:id',    adminAuth, ctrl.updateProgram);
router.delete('/:id', adminAuth, ctrl.deleteProgram);

module.exports = router;
