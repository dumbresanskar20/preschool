const Registration = require('../models/Registration');

// POST /api/registration
exports.createRegistration = async (req, res) => {
  try {
    const body = req.body;
    const parentName = body.parentName || body.name;
    const childAge = body.childAge || body.age;
    const phone = body.phone;
    const email = body.email;
    const message = body.message;
    const inquiryType = body.inquiryType || body.inquiry || 'General Inquiry';

    if (!parentName || !childAge || !phone || !email || !message) {
      console.log('Validation Failed. Received:', body);
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({ success: false, message: 'Enter a valid phone number (min 10 digits).' });
    }
    const reg = await Registration.create({ 
      parentName, 
      childAge, 
      phone, 
      email, 
      inquiryType, 
      message 
    });

    res.status(201).json({ success: true, message: 'Registration submitted successfully!', data: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// GET /api/registration (admin)
exports.getAllRegistrations = async (req, res) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? { $or: [{ parentName: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }, { inquiryType: { $regex: search, $options: 'i' } }] }
      : {};
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const total = await Registration.countDocuments(query);
    const data  = await Registration.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, data, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

// DELETE /api/registration/:id
exports.deleteRegistration = async (req, res) => {
  try {
    const reg = await Registration.findByIdAndDelete(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found.' });
    res.json({ success: true, message: 'Registration deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};
