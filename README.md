# DocMind 🧠

DocMind is a full-stack Retrieval-Augmented Generation (RAG) application that allows users to upload PDF documents and interactively chat with them. It leverages state-of-the-art free-tier AI tools to provide fast, accurate, and context-aware answers directly sourced from your documents.

## 🚀 Features

- **Document Processing**: Upload PDFs, parse text, and intelligently chunk content with overlap.
- **Serverless Embeddings**: Uses the HuggingFace Inference API (`sentence-transformers/all-MiniLM-L6-v2`) to generate embeddings without the heavy local CPU/GPU overhead.
- **Fast Vector Search**: Stores and retrieves vectors using Qdrant Cloud for blazing-fast semantic search.
- **Advanced LLM Inference**: Powered by Llama 3.3 via Groq for ultra-low latency reasoning and response generation.
- **Multi-Tenant Architecture**: Robust PostgreSQL metadata storage and user-scoped Qdrant filtering to ensure data isolation.
- **Modern UI**: A sleek, dark-themed React (Vite) interface featuring markdown support, code highlighting, and source citations.

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Vector DB**: Qdrant Cloud
- **LLM API**: Groq (`llama-3.3-70b-versatile`)
- **Embeddings**: HuggingFace Inference API
- **Orchestration**: LangChain

### Frontend
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (Glassmorphism & Dark Mode)
- **Icons**: Lucide React
- **Markdown**: `react-markdown`, `remark-gfm`, `react-syntax-highlighter`

## 📦 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/divyanshmehta355/docmind.git
cd docmind
```

### 2. Backend Setup
Navigate to the backend directory, set up a virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file by copying the example:
```bash
cp .env.example .env
```
Fill in your credentials for Groq, Qdrant Cloud, HuggingFace, and your PostgreSQL database URL.

Run the development server:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

Create a `.env` file for the frontend (optional if running backend on default port 8000):
```env
VITE_API_URL=http://localhost:8000
```

Start the Vite development server:
```bash
npm run dev
```

## 🌐 Deployment
- **Frontend**: Designed to be easily deployed on Vercel or Netlify.
- **Backend**: Can be deployed on Render, Railway, or HuggingFace Spaces. Ensure you set the environment variables exactly as they appear in `.env.example`.

## 🔒 Security
- Passwords are securely hashed using `bcrypt`.
- Authentication is handled via JWT Bearer tokens.
- Vector searches are strictly filtered at the Qdrant database level using the authenticated user's ID.

---
*Built with ❤️ by Divyansh.*
