require('dotenv').config({ path: './backend/.env' });
const sendEmail = require('./backend/config/mailer');

async function test() {
  console.log("Testing email with user:", process.env.EMAIL_USER);
  const res = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "Test Email from Script",
    text: "If you see this, email is working!"
  });
  console.log("Result:", res);
  process.exit();
}

test();
