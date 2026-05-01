(function() {
  const floatBtn = document.getElementById('chatbot-float');
  const chatWindow = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chat-close');
  const sendBtn = document.getElementById('chat-send');
  const inputEl = document.getElementById('chat-input');
  const bodyEl = document.getElementById('chat-body');

  if (!floatBtn || !chatWindow) return;

  // Toggle chat window
  floatBtn.addEventListener('click', () => {
    chatWindow.classList.add('open');
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  // Predefined Q&A
  const botBrain = [
    {
      keywords: ["fee", "cost", "price", "charge"],
      answer: "Our fees vary depending on the program. Please visit the school or contact us at 7083350502 for detailed fee structures."
    },
    {
      keywords: ["time", "timing", "hours", "open", "close"],
      answer: "We are open Monday to Friday, from 10:00 AM to 2:00 PM."
    },
    {
      keywords: ["location", "address", "where", "situated", "map"],
      answer: "We are located at Plot no. 14A/1 Rainbow Preschool, Behind Lion's Health Club, Kadolkar colony, Talegaon Dabhade, Pune."
    },
    {
      keywords: ["age", "year", "old", "criteria"],
      answer: "We accept children starting from 2 years up to 6 years of age across our different programs."
    },
    {
      keywords: ["contact", "phone", "call", "email", "number"],
      answer: "You can reach us at 7083350502 or email us at rupalimurhe11031612@gmail.com."
    },
    {
      keywords: ["program", "activity", "activities", "teach", "curriculum"],
      answer: "We offer programs focusing on holistic development, including Art & Drawing, Dance & Music, Storytelling, and Outdoor Games."
    },
    {
      keywords: ["admission", "enroll", "register", "join"],
      answer: "Admissions for 2026-27 are open! You can fill out the registration form on our website or visit our campus."
    },
    {
      keywords: ["hello", "hi", "hey", "greetings"],
      answer: "Hello! How can I help you today?"
    },
    {
      keywords: ["bye", "thank"],
      answer: "You're welcome! Have a great day!"
    }
  ];

  function getBotResponse(userText) {
    userText = userText.toLowerCase();
    
    for (let rule of botBrain) {
      for (let word of rule.keywords) {
        if (userText.includes(word)) {
          return rule.answer;
        }
      }
    }
    
    return "I'm a simple school assistant, so I might not understand everything! You can ask me about fees, timings, location, age criteria, or admissions. For more details, please call us at 7083350502.";
  }

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', sender);
    msgDiv.textContent = text;
    bodyEl.appendChild(msgDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }, 50);
  }

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    // Append user message
    appendMessage(text, 'user');
    inputEl.value = '';

    // Simulate bot typing delay
    setTimeout(() => {
      const response = getBotResponse(text);
      appendMessage(response, 'bot');
    }, 600);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });

})();
