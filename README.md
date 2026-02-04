# THREAD AI

A production-ready, unified React + Node.js AI Chat Application.

## Project Structure

This project uses a single unified codebase for both frontend and backend.

```
/
├─ src/
│  ├─ app/          // React Frontend Application
│  │  ├─ components // UI Components
│  │  ├─ hooks/     // Custom React Hooks (e.g., useChat)
│  │  └─ main.tsx   // Frontend Entry Point
│  ├─ api/          // Express Backend Routes
│  ├─ models/       // AI Model Adapters (OpenAI, DeepSeek, Mock)
│  ├─ lib/          // Shared Utilities
│  └─ server.ts     // Main Server Entry Point
├─ index.html       // Vite Entry
├─ package.json     // Unified Dependencies
└─ .env             // Environment Variables
```

## Features

- **Unified Architecture**: Frontend and backend run together.
- **Streaming Chat**: Token-by-token streaming response.
- **Reasoning Models**: Special support for "Thinking" models (like DeepSeek R1) with collapsible reasoning panels.
- **Model System**: Pluggable model adapters.
- **File Uploads**: Context injection for .txt, .json, .md files.
- **Speech-to-Text**: Browser-native speech recognition.
- **Modern UI**: Dark mode, responsive design with Tailwind CSS.

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file (see `.env.example` if available, or use the provided `.env`).
    ```
    PORT=3000
    OPENAI_API_KEY=your_key_here
    DEEPSEEK_API_KEY=your_key_here
    ```

3.  **Run Development Server**
    Starts both the Express backend and Vite frontend with HMR.
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

5.  **Run Production Server**
    ```bash
    npm start
    ```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Vite-Express
- **Streaming**: Server-Sent Events (SSE)
