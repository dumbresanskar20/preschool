const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

router.get('/', galleryController.getGallery);
router.post('/', galleryController.addGalleryImage);
router.delete('/:id', galleryController.deleteGalleryImage);
router.put('/order', galleryController.updateGalleryOrder);

module.exports = router;
