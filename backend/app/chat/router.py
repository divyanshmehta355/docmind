from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import User
from app.documents.service import get_document_by_id
from app.chat.service import query_document_stream
from app.schemas import ChatQueryRequest, ChatHistoryResponse

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/query")
def query(request: ChatQueryRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_document_by_id(db, request.document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if document.status != "ready":
        raise HTTPException(status_code=400, detail="Document is not ready yet")
        
    try:
        stream = query_document_stream(
            db=db,
            user_id=current_user.id,
            document=document,
            question=request.question
        )
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{document_id}", response_model=ChatHistoryResponse)
def get_history(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_document_by_id(db, document_id, current_user.id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    messages = [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "sources": msg.sources,
            "created_at": msg.created_at
        }
        for msg in document.messages
    ]
    
    return {"messages": messages}
