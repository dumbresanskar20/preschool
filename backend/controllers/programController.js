const Program = require('../models/Program');

// POST /api/program
exports.createProgram = async (req, res) => {
  try {
    const { title, description, ageGroup, image } = req.body;
    if (!title || !description || !ageGroup) {
      return res.status(400).json({ success: false, message: 'Title, description, and age group are required.' });
    }
    const program = await Program.create({ title, description, ageGroup, image });
    res.status(201).json({ success: true, message: 'Program created.', data: program });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/program
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });
    res.json({ success: true, data: programs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// PUT /api/program/:id
exports.updateProgram = async (req, res) => {
  try {
    const { title, description, ageGroup, image } = req.body;
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { title, description, ageGroup, image },
      { new: true, runValidators: true }
    );
    if (!program) return res.status(404).json({ success: false, message: 'Program not found.' });
    res.json({ success: true, message: 'Program updated.', data: program });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/program/:id
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: 'Program not found.' });
    res.json({ success: true, message: 'Program deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
