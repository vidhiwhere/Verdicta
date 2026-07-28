# Verdicta ⚖️
> **Practice Before You Plead** — A high-fidelity AI-powered courtroom simulator and legal advocacy training platform.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Modes of Operation](#modes-of-operation)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Gemini API Key Configuration](#gemini-api-key-configuration)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## ⚖️ Overview

**Verdicta** is an immersive courtroom simulation platform designed for legal professionals, law students, and advocacy enthusiasts. It allows users to argue legal cases before an adversarial AI bench, encounter aggressive opposing counsel, handle dynamic objections, and receive an objective, in-depth performance audit based on legal rubrics.

Whether practicing preset case studies or dynamically generating custom disputes powered by Google Gemini, **Verdicta** provides a realistic environment to sharpen courtroom skills and legal argumentation.

---

## ✨ Key Features

- **🏛️ High-Fidelity Courtroom Interface**
  - Interactive multi-role simulation: Presiding Judge, Opposing Counsel, and Witnesses/Bystanders.
  - Live audio visualizer and speech synthesis for realistic judicial voice feedback.
  - Active session transcript logging and courtroom timer controls.

- **⚡ Generative AI Advocacy**
  - Powered by Google Gemini models via `@google/generative-ai`.
  - Supports custom case briefs, jurisdictions, dynamic opposition tactics, and procedural nuances.

- **📚 Standard Practice Mode (Offline Fallback)**
  - Pre-built legal disputes spanning Constitutional Law, Criminal Law, and Commercial/Civil Disputes.
  - Works 100% offline without requiring an API key.

- **📊 Comprehensive Blind Performance Audit**
  - Evaluates legal reasoning, statutory knowledge, persuasiveness, objection management, and courtroom decorum.
  - Provides numerical scores, strengths, weaknesses, and actionable recommendations.

- **🎨 Sophisticated Courtroom Aesthetics**
  - Custom dark theme built with brass gold accents, rich mahogany woods, and glassmorphism styling.

---

## 🎯 Modes of Operation

| Mode | API Key Required? | Description |
| :--- | :---: | :--- |
| **Standard Practice** | ❌ No | High-fidelity offline simulation using pre-configured legal scenarios and branch-mapped dialogues. |
| **Generative AI Mode** | ✅ Yes (Gemini API) | Dynamic, free-form courtroom simulation using live LLM responses for custom case inputs and complex legal disputes. |

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini API)
- **Styling**: Vanilla CSS (Custom Design System with CSS Variables)
- **Voice / Speech**: Web Speech API (`SpeechSynthesis`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/Verdicta.git
   cd Verdicta
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Locally

Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Gemini API Key Configuration

To unlock **Generative AI Mode**:

1. Obtain a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. Open **Verdicta** in your browser.
3. Click the **API Settings** (gear icon) in the header.
4. Paste your Gemini API key and save. The key is securely saved in browser `localStorage`.

*Note: If no API key is provided, Verdicta automatically operates in **Offline / Standard Practice** mode.*

---

## 📁 Project Structure

```
Verdicta/
├── public/                # Static public assets
├── src/
│   ├── assets/            # Project image and media assets
│   ├── components/        # React component library
│   │   ├── Common/        # Reusable UI components (e.g. GavelLoader)
│   │   ├── Courtroom.jsx  # Main courtroom simulation interface
│   │   ├── FeedbackReport.jsx # Performance audit & evaluation screen
│   │   ├── LandingPage.jsx    # Hero landing page & mode selection
│   │   └── SetupPortal.jsx    # Scenario configuration & case builder
│   ├── data/
│   │   └── mockScenarios.js   # Pre-built legal scenarios & fallback responses
│   ├── services/
│   │   └── geminiService.js   # Google Gemini API integration module
│   ├── App.jsx            # Core application layout & state routing
│   ├── App.css            # Component styles
│   ├── index.css          # Global CSS tokens, typography & theme
│   └── main.jsx           # React DOM application entrypoint
├── index.html             # HTML entrypoint
├── package.json           # Project manifests and dependencies
└── vite.config.js         # Vite configuration
```

---

## 📜 Available Scripts

In the project directory, you can run:

- `npm run dev` — Starts the local development server with Hot Module Replacement (HMR).
- `npm run build` — Builds the application for production to the `dist` folder.
- `npm run preview` — Previews the production build locally.
- `npm run lint` — Runs ESLint to check for code quality and syntax issues.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
