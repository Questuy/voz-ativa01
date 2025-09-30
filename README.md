<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1a6mJGcC6wiHkDtoe3b-UR9Jvg1_5YKRK

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Server (local development)

1. Change to the `server` folder and install server dependencies:
   `cd server && npm install`
2. Set `GEMINI_API_KEY` in your environment (for example, create a `.env.local` or set it in your shell).
3. Start the server:
   `npm start`

Notes
- The front-end calls `/api/translate` which is proxied to `http://localhost:3001` during development. This keeps your API key on the server and out of the browser bundle.

## How to test the full translation flow (local)

Follow these steps on Windows PowerShell from the project root.

1) Install client deps (project root):

```powershell
npm install
```

2) Install server deps and create `.env` (server folder):

```powershell
cd server
npm install
# Create a .env file (do NOT commit this file). Paste your key after the =
# Example contents (replace with your real key):
# GEMINI_API_KEY=REPLACE_WITH_YOUR_KEY
# PORT=3001
# Save the file as server\.env
```

3) Start the server (still in server folder):

```powershell
npm start
```

4) Start the frontend (open a new terminal in the project root):

```powershell
npm run dev
```

5) Open the app in the browser and try translating. If you still see an error message in the UI, copy the JSON response returned by the backend (printed in the browser console / network tab) and the server console output and share them here so I can help debug further.

Quick test without a real API key

If you don't want to use a real Gemini API key yet, you can enable a mock translation mode that returns a deterministic fake translation. This helps verify the UI and speech flow end-to-end.

1. In `server/.env` add the line:

```text
MOCK_TRANSLATION=1
```

2. Start the server (`npm start`) and the frontend (`npm run dev`). The server will return translations like: `[en-US] Olá mundo` which confirms the flow is working.


