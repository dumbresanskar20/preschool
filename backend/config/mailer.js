const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("❌ BREVO_API_KEY is missing in environment variables.");
      return { success: false, error: "System Configuration Error: Missing API Key." };
    }

    console.log(`📧 Sending professional email via Brevo to: ${to || 'Admin'}`);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { 
          name: fromName || "Rainbow Preschool", 
          email: "bunnylandtalegaon@gmail.com" 
        },
        to: [{ email: to || "bunnylandtalegaon@gmail.com" }],
        replyTo: { email: replyTo || "bunnylandtalegaon@gmail.com" },
        subject: subject,
        htmlContent: html || `<p style="font-family: sans-serif; line-height: 1.6;">${(text || '').replace(/\n/g, '<br>')}</p>`,
        textContent: text
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Brevo Email Sent successfully");
      return { success: true };
    } else {
      console.error("❌ Brevo API Error:", result);
      return { success: false, error: result.message || "Brevo rejected the request" };
    }
  } catch (error) {
    console.error("❌ Brevo Connection Error:", error);
    return { success: false, error: "Network error with Brevo API." };
  }
};

module.exports = sendEmail;
