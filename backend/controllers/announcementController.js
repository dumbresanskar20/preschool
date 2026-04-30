const Announcement = require('../models/Announcement');

// POST /api/announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }
    const announcement = await Announcement.create({ title, description, date: date || Date.now() });
    res.status(201).json({ success: true, message: 'Announcement created.', data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/announcement
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/announcement/:id
exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, description, date },
      { new: true, runValidators: true }
    );
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    res.json({ success: true, message: 'Announcement updated.', data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/announcement/:id
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found.' });
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
