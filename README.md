# PDF Chat Assistant

A full-stack AI-powered application that allows users to **upload PDF documents** and **chat with them**. The system extracts content from PDFs, stores it in a vector database, and provides intelligent answers with source citations using LLMs.

---

## 🏗️ Architecture

* **Frontend**: [Next.js 15](https://nextjs.org/) (React 19) + Tailwind CSS
* **Backend**: Node.js + Express.js
* **AI/ML**: [Ollama](https://ollama.com/) for embeddings + LLM inference
* **Vector Database**: [Qdrant](https://qdrant.tech/)
* **Queue System**: BullMQ + Valkey (Redis alternative)
* **PDF Parsing**: [LangChain](https://www.langchain.com/)
* Also create .env file on client folder and add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY

---

## ⚙️ macOS Prerequisites

### 1. Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js & pnpm

```bash
brew install node
npm install -g pnpm
```

### 3. Install Docker Desktop

```bash
brew install --cask docker
```

### 4. Install Ollama

```bash
brew install ollama
```

### 5. Start Ollama

```bash
# Start in background
brew services start ollama

# Or manually
ollama serve
```

### 6. Pull Required Ollama Models

```bash
ollama pull nomic-embed-text     # For embeddings
ollama pull llama3.2             # For chat completion
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pdf-chat-assistant.git
cd pdf-chat-assistant
```

### 2. Start Docker Services

```bash
docker-compose up -d
```

Services:

* **Valkey** (port: `6379`)
* **Qdrant** (port: `6333`)

---

## 🔧 Project Setup

### Backend (Server)

```bash
cd server
pnpm install
```

Create a `.env` file:

```env
# Redis/Valkey
REDIS_HOST=localhost
REDIS_PORT=6379

# Qdrant
QDRANT_URL=http://localhost:6333

# Server
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Frontend (Client)

```bash
cd ../client
npm install
```

---

## 🧪 Running the App

You need **3 terminal tabs/windows**:

### Terminal 1: Start API Server

```bash
cd server
pnpm run dev
```

### Terminal 2: Start Worker

```bash
cd server
pnpm run dev:worker
```

### Terminal 3: Start Frontend

```bash
cd client
npm run dev
```

Now open [http://localhost:3000](http://localhost:3000) to start using the app.

---

## 📚 Usage

1. Upload a PDF file from the frontend.
2. Wait for it to be processed in the background.
3. Start chatting with the document!
4. See citations for every answer pulled from the PDF.

---

## 📁 Project Structure

```
pdf-chat-assistant/
├── server/                 # Express backend
│   ├── index.js           # API entry point
│   ├── worker.js          # BullMQ job processor
│   ├── package.json
│   └── .env
├── client/                # Next.js frontend
│   ├── app/               # Routes and pages
│   ├── components/        # Reusable React components
│   └── package.json
├── docker-compose.yml     # Qdrant & Valkey containers
└── README.md
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:8000`

* `GET /` — Health check
* `POST /upload/pdf` — Upload a PDF
* `GET /job/:jobId` — Check processing status
* `GET /chat?message=your-query` — Ask questions

---

## 🧰 Dev Scripts

### Server (pnpm)

* `pnpm run dev` — Start server in dev mode
* `pnpm run dev:worker` — Start background worker

### Client (npm)

* `npm run dev` — Start frontend (Turbopack)
* `npm run build` — Production build
* `npm run start` — Start production server
* `npm run lint` — Run ESLint

---

## ✅ Features

* 📄 Upload and parse PDFs
* 🔍 Vector search using embeddings
* 💬 AI-powered chat interface
* 🔗 Answers with source citations
* 🛠️ Async background processing
* 🔁 Real-time status updates

---

## 🧪 macOS Troubleshooting

### Ollama

```bash
curl http://localhost:11434/api/version       # Check Ollama status
brew services restart ollama                  # Restart Ollama
ollama list                                   # List models
```

### Docker

```bash
docker ps                                     # List running containers
docker-compose down && docker-compose up -d  # Restart services
docker-compose logs qdrant                   # Logs for Qdrant
docker-compose logs valkey                   # Logs for Valkey
```

### Port Conflicts

```bash
lsof -i :3000   # Frontend
lsof -i :8000   # API Server
lsof -i :6379   # Redis/Valkey
lsof -i :6333   # Qdrant
lsof -i :11434  # Ollama
```

---

---
###Screenshot

<img width="1710" height="1107" alt="Image" src="https://github.com/user-attachments/assets/d44a431c-cbd1-496e-8785-ed7dc0e9fc01" />

<img width="1710" height="1107" alt="Image" src="https://github.com/user-attachments/assets/690c860f-2643-46d4-9425-ffe9b917870a" />

<img width="1710" height="1107" alt="Image" src="https://github.com/user-attachments/assets/06af0199-232b-4d7d-bcef-f7776522439f" />

<img width="1710" height="1107" alt="Image" src="https://github.com/user-attachments/assets/177d5eb3-bfba-49ab-9434-d09e886e8873" />

<img width="1710" height="1107" alt="Image" src="https://github.com/user-attachments/assets/05306ea1-3f08-4ae4-b73a-52ccd322c3a2" />

### PDF(for testing)

[A_Brief_Introduction_To_AI.pdf](https://github.com/user-attachments/files/21478107/A_Brief_Introduction_To_AI.pdf)

---

