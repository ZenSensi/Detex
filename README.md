
```
 ██████╗ ███████╗████████╗███████╗██╗  ██╗
 ██╔══██╗██╔════╝╚══██╔══╝██╔════╝╚██╗██╔╝
 ██║  ██║█████╗     ██║   █████╗   ╚███╔╝ 
 ██║  ██║██╔══╝     ██║   ██╔══╝   ██╔██╗ 
 ██████╔╝███████╗   ██║   ███████╗██╔╝ ██╗
 ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝
```
> **AI-Powered Fraud Detection — Minimal. Sharp. Unforgiving.**

---

```
┌─────────────────────────────────────────────────────────────┐
│  STATUS   ██████████████████████████░░░░░  PRODUCTION READY │
│  VERSION  v1.0.0                                            │
│  AUTHOR   Arnabh                                            │
│  LICENSE  MIT                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## ▸ WHAT IS THIS

**Detex** is a minimalist, high-contrast monochrome tool that classifies text in real-time as:

```
  [ SAFE ]       [ SUSPICIOUS ]       [ FRAUD ]
     ✓                 ⚠                  ✗
```

Built for speed and clarity — no noise, no distractions. Just signal.

---

## ▸ FEATURES

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ◈  AI-powered fraud analysis via OpenRouter/GPT            │
│   ◈  Real-time text classification (3-tier system)           │
│   ◈  Dual-panel sidebar navigation                           │
│   ◈  Persistent Dark / Light mode preferences               │
│   ◈  Firebase Authentication & Firestore integration         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ▸ STACK

```
  FRONTEND    →   HTML · CSS · Vanilla JS
  AI LAYER    →   OpenRouter API (GPT backbone)
  AUTH        →   Firebase Authentication
  DATABASE    →   Firestore
  THEME       →   Monochrome · High-Contrast · Minimal
```

---

## ▸ CLASSIFICATION LOGIC

```
  INPUT TEXT
      │
      ▼
  ┌─────────┐
  │   GPT   │  ◄─── system prompt + context rules
  └────┬────┘
       │
  ┌────▼────────────────────────────────────┐
  │  SAFE          Score: 0–30              │
  │  SUSPICIOUS    Score: 31–69             │
  │  FRAUD         Score: 70–100            │
  └─────────────────────────────────────────┘
```

---

## ▸ LOCAL SETUP

```bash
# 1. Clone the repo
git clone https://github.com/your-username/detex.git
cd detex

# 2. Add your keys
cp .env.example .env
# → Fill in OPENROUTER_API_KEY + Firebase config

# 3. Serve locally
npx serve .
# or open index.html in a Live Server
```

---

## ▸ ENV CONFIGURATION

```
OPENROUTER_API_KEY   =   your_openrouter_key_here
FIREBASE_API_KEY     =   your_firebase_key_here
FIREBASE_PROJECT_ID  =   your_project_id_here
```

> ⚠ Never expose API keys in public repos. Use `.env` and add it to `.gitignore`.

---

## ▸ FILE STRUCTURE

```
detex/
├── index.html          ← entry point
├── app.js              ← core logic + API calls
├── style.css           ← monochrome design system
├── firebase.js         ← auth + firestore handlers
├── .env                ← secrets (gitignored)
└── README.md
```

---

## ▸ HOW IT LOOKS

```
╔══════════════════════════════════════════════════════════════╗
║  DETEX                                    [DARK ◈] [LIGHT ○] ║
╠══════════════════════════════════════════════════════════════╣
║  ┌────────────┐  ┌──────────────────────────────────────┐   ║
║  │  HISTORY   │  │  PASTE OR TYPE TEXT BELOW            │   ║
║  │────────────│  │                                      │   ║
║  │  > Input 1 │  │  ______________________________      │   ║
║  │  > Input 2 │  │                                      │   ║
║  │  > Input 3 │  │            [ ANALYZE ]               │   ║
║  └────────────┘  │                                      │   ║
║                  │  RESULT: ██ FRAUD  (Score: 87)       │   ║
║                  └──────────────────────────────────────┘   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## ▸ CONTRIBUTING

```
Fork → Branch → PR
No fluff. Keep it clean. Match the aesthetic.
```

---

## ▸ AUTHOR

```
  ╔═══════════════════════════════╗
  ║   built by  A R N A B H       ║
  ║   ── quietly shipping ──      ║
  ╚═══════════════════════════════╝
```

---

```
© 2025 Arnabh · MIT License
```
