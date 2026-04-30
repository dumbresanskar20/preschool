const Content = require('../models/Content');

// GET /api/content  — get the singleton website content doc
exports.getContent = async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) {
      content = await Content.create({});   // seed defaults on first access
    }
    res.json({ success: true, data: content });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/content  — upsert the singleton doc
exports.updateContent = async (req, res) => {
  try {
    const { aboutText, contactEmail, phoneNumber, address, schoolTimings } = req.body;
    let content = await Content.findOne();
    if (!content) {
      content = await Content.create({ aboutText, contactEmail, phoneNumber, address, schoolTimings });
    } else {
      if (aboutText     !== undefined) content.aboutText     = aboutText;
      if (contactEmail  !== undefined) content.contactEmail  = contactEmail;
      if (phoneNumber   !== undefined) content.phoneNumber   = phoneNumber;
      if (address       !== undefined) content.address       = address;
      if (schoolTimings !== undefined) content.schoolTimings = schoolTimings;
      await content.save();
    }
    res.json({ success: true, message: 'Website content updated.', data: content });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
