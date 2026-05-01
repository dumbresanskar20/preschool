const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  try {
    console.log(`📧 Sending via Web API to: ${to || 'Admin'}`);

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

    // Check if the response is actually JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      if (result.success === "true") {
        console.log("✅ Web API Email Sent Successfully");
        return { success: true };
      }
    }

    // If we are here, it's likely an activation issue or a non-JSON error page
    if (response.status === 403 || response.status === 401) {
      return { success: false, error: "Please check bunnylandtalegaon@gmail.com and click ACTIVATE in the FormSubmit email." };
    }

    return { success: false, error: `Web API Status: ${response.status}. Please ensure the form is activated.` };

  } catch (error) {
    console.error("❌ Web API Connection Error:", error);
    return { success: false, error: "Network error. Please try again in a moment." };
  }
};

module.exports = sendEmail;
