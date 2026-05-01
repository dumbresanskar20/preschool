const Gallery = require('../models/Gallery');

// GET /api/gallery
exports.getGallery = async (req, res) => {
  try {
    const images = await Gallery.find().sort({ order: 1 });
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// POST /api/gallery (for admin use, even if not explicitly asked, helps in testing)
exports.addGalleryImage = async (req, res) => {
  try {
    const { imageUrl, altText, order } = req.body;
    const newImage = await Gallery.create({ imageUrl, altText, order });
    res.status(201).json({ success: true, data: newImage });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Image removed from gallery.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
