const Contact = require('../models/Contact');
const sendEmail = require('../config/mailer');

exports.submitContact = async (req, res) => {
  // 4. Confirm API is hit from Frontend
  console.log("DEBUG: API /contact hit");

  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    const contact = await Contact.create({ name, email, message });

    // 7. Ensure response is returned AFTER email logic (Sequential execution)
    // 1. Notification to School
    console.log("DEBUG: Sending notification to school...");
    await sendEmail({
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      replyTo: email,
      fromName: 'Rainbow Website'
    });

    // Small delay to ensure Gmail handles sequential messages
    await new Promise(r => setTimeout(r, 1000));

    // 2. Auto-reply to User
    console.log(`DEBUG: Sending auto-reply to user: ${email}`);
    const autoReplyRes = await sendEmail({
      to: email,
      subject: 'Message Received - Rainbow Preschool',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #f97316;">Hello ${name}!</h2>
          <p>Thank you for reaching out to <strong>Rainbow Preschool</strong>.</p>
          <p>We have received your message and our team will get back to you as soon as possible.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9rem; color: #666;">This is an automated response. Please do not reply directly to this email.</p>
          <p style="font-weight: bold; color: #f97316;">Best Regards,<br>Rainbow Preschool Team</p>
        </div>
      `,
      text: `Hello ${name}, Thank you for reaching out to Rainbow Preschool. We have received your message and will get back to you soon.`
    });

    if (!autoReplyRes.success) {
      throw new Error(`Email delivery failed: ${autoReplyRes.error || 'Unknown Error'}`);
    }

    console.log("DEBUG: All emails sent successfully for contact form.");

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully! Check your email for confirmation.', 
      data: contact 
    });
  } catch (err) {
    console.error('❌ Contact API Error:', err);
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
