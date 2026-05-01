const sendEmail = async ({ to, subject, text, html, replyTo, fromName }) => {
  try {
    console.log(`📧 Web API attempt for: ${subject}`);

    const response = await fetch("https://formsubmit.co/ajax/bunnylandtalegaon@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        subject: subject,
        name: fromName || 'Rainbow Preschool',
        email: replyTo || to,
        message: text
      })
    });

    const responseText = await response.text();
    console.log("DEBUG: FormSubmit Raw:", responseText);

    if (response.ok) {
      return { success: true };
    }

    if (response.status === 403 || response.status === 401 || responseText.includes("activate")) {
      return { success: false, error: "FormSubmit says: Activation needed. Check bunnylandtalegaon@gmail.com one more time." };
    }

    return { success: false, error: `Error (${response.status}): ${responseText.substring(0, 40)}` };

  } catch (error) {
    console.error("❌ Web API Error:", error);
    return { success: false, error: "Connection error. Please try again." };
  }
};

module.exports = sendEmail;
