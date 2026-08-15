import os
from celery import Celery
import requests
from app.config import get_settings
from app.database import SessionLocal
from app.models import Document
from app.documents.service import process_document
import logging

settings = get_settings()
logger = logging.getLogger(__name__)

celery_app = Celery(
    "docmind_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    worker_concurrency=2, # Limits concurrent memory usage on free tiers
    worker_max_tasks_per_child=10, # Prevent memory leaks
)

@celery_app.task(name="process_document_task")
def process_document_task(document_id: str, user_id: str):
    logger.info(f"Starting Celery task to process document: {document_id}")
    
    db = SessionLocal()
    try:
        document = db.query(Document).filter(
            Document.id == document_id, 
            Document.user_id == user_id
        ).first()
        
        if not document:
            logger.error(f"Document {document_id} not found in database.")
            return False
            
        if not document.pdf_url:
            logger.error(f"Document {document_id} has no pdf_url.")
            document.status = "error"
            document.error_message = "Document is missing its cloud URL."
            db.commit()
            return False
            
        # Download the PDF from ImageKit into memory
        logger.info(f"Downloading PDF from {document.pdf_url}")
        response = requests.get(document.pdf_url, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Failed to download PDF. Status code: {response.status_code}")
            document.status = "error"
            document.error_message = f"Failed to fetch PDF from storage (HTTP {response.status_code})"
            db.commit()
            return False
            
        pdf_bytes = response.content
        
        # Now process the document using existing logic
        logger.info(f"Processing PDF (size: {len(pdf_bytes)} bytes)")
        process_document(db=db, user_id=user_id, document=document, pdf_bytes=pdf_bytes)
        
        logger.info(f"Successfully processed document: {document_id}")
        return True
        
    except Exception as e:
        logger.exception(f"Exception during Celery processing of {document_id}")
        
        # Try to mark it as error in the DB
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document:
                document.status = "error"
                document.error_message = f"Background processing failed: {str(e)[:250]}"
                db.commit()
        except:
            pass
            
        return False
        
    finally:
        db.close()
