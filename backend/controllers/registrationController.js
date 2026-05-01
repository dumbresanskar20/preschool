const Registration = require('../models/Registration');
const sendEmail = require('../config/mailer');

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

    // Send emails in background
    Promise.allSettled([
      // 1. Notification to School
      sendEmail({
        subject: `New Registration Inquiry: ${inquiryType}`,
        text: `Parent: ${parentName}\nChild's Age: ${childAge}\nPhone: ${phone}\nEmail: ${email}\nInquiry For: ${inquiryType}\nMessage: ${message}`,
        replyTo: email,
        fromName: 'Bunnyland Admissions'
      }),
      // 2. Auto-reply to Parent
      sendEmail({
        to: email,
        subject: 'Registration Inquiry Received - Bunnyland Preschool',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #c2410c;">Dear ${parentName},</h2>
            <p>Warm greetings from <strong>Bunnyland Preschool!</strong></p>
            <p>Thank you for inquiring about our programs. We have received your registration details for your child (Age: ${childAge}).</p>
            <p>Our admissions team will review your inquiry and contact you shortly at <strong>${phone}</strong> to discuss the next steps.</p>
            <div style="background: #fff8f0; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f97316;">
              <strong>Your Message:</strong><br>
              <i style="color: #555;">"${message}"</i>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.9rem; color: #666;">This is an automated confirmation of your inquiry.</p>
            <p style="font-weight: bold; color: #c2410c;">Best Regards,<br>Admissions Office<br>Bunnyland Preschool</p>
          </div>
        `,
        text: `Dear ${parentName}, Thank you for your inquiry at Bunnyland Preschool. We have received your details and will contact you soon.`
      })
    ]).then(results => {
      results.forEach((res, i) => {
        if (res.status === 'fulfilled' && !res.value.success) {
          console.error(`❌ Registration Email ${i+1} failed:`, res.value.message || res.value.error);
        } else if (res.status === 'rejected') {
          console.error(`❌ Registration Email ${i+1} error:`, res.reason);
        } else {
          console.log(`✅ Registration Email ${i+1} sent successfully.`);
        }
      });
    });

    res.status(201).json({ success: true, message: 'Registration submitted! A confirmation email has been sent to you.', data: reg });
  } catch (err) {
    console.error('Registration Error:', err);
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
