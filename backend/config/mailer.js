const nodemailer = require('nodemailer');

// Create a singleton transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000
});

// Verify connection configuration on startup
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Mailer Verification Error:', error);
    } else {
      console.log('📧 Mailer is ready to take messages');
    }
  });
}

/**
 * Utility to send emails using Nodemailer
 */
const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return { success: false, message: 'Email credentials not configured.' };
    }

    console.log(`📧 Sending email to: ${to || process.env.EMAIL_USER}`);

    const mailOptions = {
      from: `"${fromName || 'Bunnyland Preschool'}" <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER,
      replyTo: replyTo || process.env.EMAIL_USER,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error('❌ SendEmail Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
