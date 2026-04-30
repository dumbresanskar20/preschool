const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const contact = await Contact.create({ name, email, message });

    // Send Email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || email,
        to: 'dumbresanskar23@gmail.com',
        subject: `New Contact Form Submission from ${name}`,
        text: `You have received a new contact message:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`
      };

      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error('Email sending failed:', mailError);
      // We still return success since the data was saved to DB successfully
    }

    res.status(201).json({ success: true, message: 'Message sent successfully!', data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', error: err.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
