const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const key = process.env.GEMINI_API_KEY;
    
    if (!key) {
      return res.status(200).json({ 
        reply: "I am your AI Healthcare Assistant. However, the administrator hasn't configured my brain (GEMINI_API_KEY) yet. Please ask the admin to set it up!" 
      });
    }

    const prompt = `You are a helpful, professional, and empathetic AI Healthcare Assistant for the MediNova Hospital Management System.
The user is a patient asking a medical or system-related question.
Their message: "${message}"

Provide a brief, reassuring, and informative answer. Do not give direct medical diagnoses, advise them to consult their doctor. Format your answer nicely in plain text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
      })
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.status(200).json({ reply: text || "I'm sorry, I couldn't process your request at this time." });
  } catch (error) {
    console.error('[Chatbot Error]', error.message);
    res.status(500).json({ reply: "I'm currently experiencing technical difficulties. Please try again later." });
  }
});

module.exports = router;
