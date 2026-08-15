import pymupdf
from sqlalchemy.orm import Session
from app.models import Document
from app.documents.chunking import chunk_document
from app.rag.embeddings import get_embeddings_model
from app.rag.vectorstore import store_chunks, delete_document_chunks
import logging

logger = logging.getLogger(__name__)

def parse_pdf(pdf_bytes: bytes) -> list[dict]:
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        if text.strip():
            pages.append({
                "page_number": page_num + 1,
                "text": text
            })
            
    return pages

def process_document(db: Session, user_id: str, document: Document, pdf_bytes: bytes):
    try:
        pages = parse_pdf(pdf_bytes)
        document.page_count = len(pages)
        
        chunks = chunk_document(pages)
        document.chunk_count = len(chunks)
        
        if not chunks:
            document.status = "error"
            document.error_message = "No text could be extracted from the PDF"
            db.commit()
            return
            
        embeddings_model = get_embeddings_model()
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embeddings_model.embed_documents(texts)
        
        store_chunks(
            user_id=user_id,
            document_id=document.id,
            chunks=chunks,
            embeddings=embeddings,
        )
        
        document.status = "ready"
        db.commit()
        
    except Exception as e:
        logger.exception(f"Error processing document {document.id}")
        document.status = "error"
        document.error_message = str(e)[:500]
        db.commit()

def get_documents_by_user(db: Session, user_id: str) -> list[Document]:
    return db.query(Document).filter(Document.user_id == user_id).order_by(Document.created_at.desc()).all()

def get_document_by_id(db: Session, document_id: str, user_id: str) -> Document | None:
    return db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()

def remove_document(db: Session, document: Document, user_id: str):
    from app.config import get_settings
    from imagekitio import ImageKit
    
    settings = get_settings()
    
    # 1. Delete from Qdrant
    delete_document_chunks(user_id=user_id, document_id=document.id)
    
    # 2. Delete from ImageKit
    if document.imagekit_file_id and settings.IMAGEKIT_PUBLIC_KEY and settings.IMAGEKIT_PRIVATE_KEY:
        try:
            imagekit = ImageKit(
                public_key=settings.IMAGEKIT_PUBLIC_KEY,
                private_key=settings.IMAGEKIT_PRIVATE_KEY,
                url_endpoint=settings.IMAGEKIT_URL_ENDPOINT
            )
            imagekit.delete_file(file_id=document.imagekit_file_id)
        except Exception as e:
            logger.error(f"Failed to delete file from ImageKit: {e}")
            pass
            
    # 3. Delete from DB (cascades delete Chat Messages)
    db.delete(document)
    db.commit()
