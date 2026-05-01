const nodemailer = require('nodemailer');

// 3. Verify Transporter Configuration at Runtime
console.log("DEBUG: Initializing Mailer...");
console.log("DEBUG: EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("DEBUG: EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  pool: true,   // Use connection pooling
  maxConnections: 1,
  maxMessages: 5,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000,
  socketTimeout: 15000
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mailer Runtime Error:', error);
  } else {
    console.log('📧 Mailer is authenticated and ready to send.');
  }
});

/**
 * Utility to send emails with detailed logging
 */
const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL_USER or EMAIL_PASS missing at runtime.");
      return { success: false, message: 'Email credentials not configured.' };
    }

    // 1. Verify Trigger Execution
    console.log(`DEBUG: Preparing to send email to: ${to || process.env.EMAIL_USER}`);

    const mailOptions = {
      from: `"${fromName || 'Rainbow Preschool'}" <${process.env.EMAIL_USER}>`,
      to: to || process.env.EMAIL_USER,
      replyTo: replyTo || process.env.EMAIL_USER,
      subject: subject,
      text: text,
      html: html
    };

    // 6. Ensure API is awaited properly
    const info = await transporter.sendMail(mailOptions);
    
    // 2. Add Detailed Logging for Email Sending
    console.log("✅ Email sent successfully:", info.response);
    return { success: true, info };
  } catch (error) {
    // 2. Add Detailed Logging for failures
    console.error("❌ Email failed for:", to || 'Admin', error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
