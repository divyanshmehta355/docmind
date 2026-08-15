import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.rag.vectorstore import init_collection
from app.rag.embeddings import get_embeddings_model
from app.rag.llm import get_llm
from app.auth.router import router as auth_router
from app.documents.router import router as documents_router
from app.chat.router import router as chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-25s | %(levelname)-7s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting DocMind backend...")
    init_db()
    logger.info("Database tables initialized")

    # Safe fallback to add new columns to existing deployments without wiping data
    from app.database import engine
    from sqlalchemy import text

    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE documents ADD COLUMN pdf_url VARCHAR"))
            logger.info("Added pdf_url column to documents table")
        except Exception:
            pass  # Column already exists

    with engine.begin() as conn:
        try:
            conn.execute(
                text("ALTER TABLE documents ADD COLUMN imagekit_file_id VARCHAR")
            )
            logger.info("Added imagekit_file_id column to documents table")
        except Exception:
            pass  # Column already exists

    model = get_embeddings_model()
    logger.info(f"Embedding client ready: {model.model}")

    init_collection()
    logger.info("Qdrant collection ready")

    llm = get_llm()
    logger.info(f"LLM client ready: {llm.model_name}")

    logger.info("DocMind backend is ready!")
    yield
    logger.info("Shutting down DocMind backend...")


app = FastAPI(
    title="DocMind API",
    description="Full-stack RAG application for PDF chat",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chat_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
