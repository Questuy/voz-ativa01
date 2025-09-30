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
