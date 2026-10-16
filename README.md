# TempMailer ⚡

> **Instant Temporary Disposable Email for Sign-ins & Account OTP Verification.**  
> Built for developers, QA testers, and privacy-conscious users who need fast verification codes without giving away their personal inboxes.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![React](https://img.shields.io/badge/React-19-61dafb)]()
[![Vite](https://img.shields.io/badge/Vite-8-646cff)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)]()

---

## ✨ Why TempMailer?

Traditional disposable email tools force you to wait, refresh constantly, click through cluttered inboxes, and scroll through promotional marketing junk just to find a 6-digit confirmation code.

**TempMailer is built specifically for one job:** getting your sign-up verification codes and activation links in seconds.

---

## 🚀 Standout Features

### 1. 🔑 Instant OTP & Link Auto-Extractor
- **Direct Row-Level OTP Badge:** Detects 4-to-8 digit verification codes and Google-style codes (`G-XXXXXX`) in incoming messages.
- **1-Click Copy:** Copy your OTP code directly from the inbox list without even clicking into the email!
- **Hero Action Card:** Prominent, high-contrast action banner inside message details with 1-click OTP copying and direct "Open Verification Link" buttons.

### 2. 🔔 Zero-Asset Audio Chime & Tab Flasher
- **In-Browser Web Audio Synthesis:** Synthesizes a clean dual-tone chime (587Hz & 880Hz) with 0 external MP3/WAV assets.
- **Document Title Flasher:** Flashes `(1) New OTP Received! • TempMailer` when your browser tab is inactive so you know the exact second your code arrives.
- **Desktop Notifications:** Native Notification API support with 1-click permission opt-in.

### 3. ⚡ Quick Signup Companion Toolkit
- **Cryptographic Password Generator:** Generates high-entropy passwords (`16`, `24`, `32` chars) using the browser's native `window.crypto.getRandomValues`.
- **Fake Test Persona Generator:** Generates realistic test names and handles in 1 click to fill sign-up forms in seconds.

### 4. 🗄️ Multi-Mailbox Vault Switcher
- **5 Concurrent Inboxes:** Spin up and maintain up to 5 concurrent active disposable inboxes simultaneously.
- **Session Switcher:** Switch between multiple mailboxes with 1 click; sessions are safely cached in browser `sessionStorage`.

### 5. ✏️ Address Customization (Like `temp-mail.org/en/change`)
- **Custom Username Prefix:** Choose any custom username (e.g., `testuser99`).
- **Domain Selector:** Choose from multiple supported domain extensions (`@guerrillamailblock.com`, `@sharklasers.com`, `@guerrillamail.net`, `@spam4.me`, `@grr.la`, etc.).
- **Randomize:** Instant random username and domain generator.

### 6. 📱 QR Code Scanner
- Quick modal with generated QR code to easily scan and use the temporary email on mobile devices.

### 7. 🛡️ Sanitized Zero-Exploit Email Reader
- Emails are sanitized using **DOMPurify** with strict security hooks to neutralize XSS vectors, phishing scripts, and trackers.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Security:** DOMPurify
- **Linter:** Oxlint (0 errors, 0 warnings)
- **Email Engine:** GuerrillaMail REST API (100% client-side with native wildcard CORS `*`)

---

## 🏃 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Shivam-io-afk/TempMailer.git
cd TempMailer

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` (or `http://localhost:5174/`) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite:

```bash
# Run unit test suites (API, OTP Extractor, Crypto Generator)
npm run test:unit

# Run linter
npm run lint

# Build for production
npm run build
```

---

## 📦 Production Deployment

Because TempMailer runs 100% in the browser with zero backend server dependencies, you can deploy the generated `dist/` directory to any static web host:

- **Vercel:** `npx vercel`
- **Netlify:** `npx netlify deploy --prod --dir=dist`
- **GitHub Pages:** Deploy `dist/` branch or static workflow

---

## 🔒 Privacy & Safety Guarantee

- **Zero Server Logging:** No user emails, tokens, or IP addresses are stored on custom servers.
- **Client-Side Storage:** Active mailbox session tokens are persisted exclusively in browser `sessionStorage`.
- **Destructible:** Destroy mailboxes at any time with the 1-click Burn button.

---

## 📄 License

MIT License © 2026 TempMailer
