const nodemailer = require('nodemailer');

const sendEmail = async ({ subject, text, replyTo, fromName }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured. Skipping email.");
      return { success: false, message: 'Email credentials not configured.' };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${fromName || 'Rainbow Preschool'}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to the default mail user
      replyTo: replyTo || process.env.EMAIL_USER,
      subject: subject,
      text: text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
