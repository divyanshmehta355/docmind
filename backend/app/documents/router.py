from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User, Document
from app.schemas import DocumentResponse, DocumentListResponse
from app.documents.service import process_document, get_documents_by_user, get_document_by_id, remove_document

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
    document = Document(
        user_id=current_user.id,
        filename=file.filename,
        status="processing"
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    
    background_tasks.add_task(
        process_document,
        db=db,
        user_id=current_user.id,
        document=document,
        pdf_bytes=content
    )
    
    return document

@router.get("/", response_model=DocumentListResponse)
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = get_documents_by_user(db, current_user.id)
    return {"documents": docs}

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_document_by_id(db, document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if document.status == "processing":
        raise HTTPException(status_code=400, detail="Cannot delete a document while it is processing")
        
    remove_document(db=db, document=document, user_id=current_user.id)
    return None
