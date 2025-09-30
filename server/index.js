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
    console.log('Received /api/translate request body:', JSON.stringify(req.body));
    if (!text || !sourceLang || !targetLang) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // If MOCK_TRANSLATION is enabled, return a fake translation so the
    // frontend and speech parts can be tested without a real API key.
    if (process.env.MOCK_TRANSLATION === '1') {
      // Very simple mock: prepend the target language code to the text.
      return res.json({ translation: `[${targetLang}] ${text}` });
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

// Health endpoint to verify server is up
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handlers to catch unexpected exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 3001;
// Default to 0.0.0.0 so the dev server is reachable from other devices on the LAN
// (use HOST=127.0.0.1 in .env if you only want localhost). For production use a
// secured configuration.
const host = process.env.HOST || '0.0.0.0';

// Ensure log directory exists
const logFile = path.join(__dirname, 'requests.log');

app.listen(port, host, () => {
  console.log(`Translation server listening on http://${host}:${port}`);
});

// Append request bodies to a local log file for debugging (append-only)
const appendRequestLog = (obj) => {
  try {
    fs.appendFileSync(logFile, JSON.stringify({ timestamp: new Date().toISOString(), body: obj }) + '\n');
  } catch (e) {
    console.error('Failed to write request log:', e);
  }
};

// wrap the existing POST handler to also write to the log file
const originalPost = app._router.stack.find((r) => r.route && r.route.path === '/api/translate' && r.route.methods.post);
if (originalPost) {
  const layer = originalPost.route.stack[0];
  const originalHandler = layer.handle;
  layer.handle = async (req, res, next) => {
    appendRequestLog(req.body);
    return originalHandler(req, res, next);
  };
}
