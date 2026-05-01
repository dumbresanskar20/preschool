const nodemailer = require('nodemailer');

/**
 * Utility to send emails using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email (defaults to EMAIL_USER)
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content (optional)
 * @param {string} options.replyTo - Reply-to address
 * @param {string} options.fromName - Display name for sender
 */
const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
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
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000
    });

    console.log(`📧 Attempting to send email via: ${process.env.EMAIL_USER.substring(0, 4)}... @gmail.com`);

    const mailOptions = {
      from: `"${fromName || 'Bunnyland Preschool'}" <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER,
      replyTo: replyTo || process.env.EMAIL_USER,
      subject: subject,
      text: text,
      html: html
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
