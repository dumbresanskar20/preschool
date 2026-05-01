const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  try {
    console.log(`📧 Sending via Web API to: ${to || 'Admin'}`);

    // We use FormSubmit's AJAX API because Render blocks SMTP (Port 465/587)
    // This uses HTTPS (Port 443) which is never blocked.
    const response = await fetch("https://formsubmit.co/ajax/bunnylandtalegaon@gmail.com", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: subject,
        _replyto: replyTo || to,
        from_name: fromName || 'Rainbow Preschool',
        message: text,
        _template: 'table',
        _autoresponse: "Thank you for reaching out to Rainbow Preschool. We have received your inquiry and will get back to you shortly!"
      })
    });

    const result = await response.json();
    
    if (result.success === "true") {
      console.log("✅ Web API Email Sent Successfully");
      return { success: true };
    } else {
      console.error("❌ Web API Error:", result);
      return { success: false, error: "API rejected the request" };
    }
  } catch (error) {
    console.error("❌ Web API Connection Error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
