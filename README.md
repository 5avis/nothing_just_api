# Nothing Just API 🌌

A sleek, minimal AI chatbot with a dark space aesthetic, powered by ultra-fast LLM APIs (Groq and Google Gemini). Zero bloated dependencies, clean serverless backend, and designed for private, session-only conversations.

---

## ✨ Features

- **Blazing Fast AI Responses**:
  - Native support for **Groq API** (`groq/compound-mini`) with sub-second response times (~0.8s).
  - Fallback support for **Google Gemini API** (`gemini-3.5-flash-lite`).
- **Zero-Storage Session Memory**:
  - Welcomes you by name on arrival.
  - No database, no tracking, no persistent storage—everything stays strictly within your current session.
- **Modern Space UI**:
  - Immersive dark space theme with ambient glassmorphism and smooth micro-animations.
  - Responsive layout (works seamlessly on desktop and mobile).
  - Clean markdown formatting with one-click code block copying.
  - Voice-to-text input support.
- **Deploy Anywhere**:
  - Ready for one-click deployment on **Vercel** as serverless functions, or run locally using lightweight Node.js.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/5avis/nothing_just_api.git
cd nothing_just_api
```

### 2. Configure Environment Variables
Copy the `.env.example` template:
```bash
cp .env.example .env
```

Open `.env` and add your free API key:
```env
# Groq (Recommended for fastest replies ~0.8s): https://console.groq.com/
GROQ_API_KEY=gsk_your_groq_api_key_here

# OR Google Gemini: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Locally
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser!

---

## ☁️ Deployment (Vercel)

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com) and import your repository.
3. Under **Project Settings ➔ Environment Variables**, add your key:
   - `GROQ_API_KEY` (or `GEMINI_API_KEY`)
4. Click **Deploy**.

---

## 🛠️ Project Structure

```
nothing_just_api/
├── api/
│   └── chat.js          # Serverless API route handling Groq/Gemini requests
├── public/
│   └── clementine.svg   # Brand icon asset
├── index.html           # Single-page chat application UI
├── server.js            # Lightweight Node.js local dev server
├── package.json         # Scripts and project metadata
├── .env.example         # Template for environment variables
└── README.md            # Project documentation
```

---

## 📄 License
MIT License. Created for personal and experimental use.
