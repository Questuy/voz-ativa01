// Simple express server to host a secure translation endpoint using @google/genai
// Load environment variables from a .env file when present (development)
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const getLanguageName = (code) => {
  switch (code) {
    case 'en-US':
      return 'Inglês';
    case 'pt-BR':
      return 'Português';
    default:
      return code;
  }
};

app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      // Helpful hint for developers: tell them which env var is expected
      return res.status(500).json({ error: 'API key not configured on server. Set GEMINI_API_KEY (or API_KEY) in environment or in a .env file.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Traduza o seguinte texto de ${getLanguageName(sourceLang)} para ${getLanguageName(targetLang)}. Forneça apenas o texto traduzido, sem quaisquer explicações, introduções ou aspas adicionais. O texto original é: "${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translated = (response && response.text) ? response.text.trim() : '';
    return res.json({ translation: translated });
  } catch (err) {
    console.error('Server translation error:', err);
    // Include basic error details to help debugging in development
    return res.status(500).json({ error: 'Translation failed', details: err && err.message ? err.message : String(err) });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Translation server listening on port ${port}`);
});
