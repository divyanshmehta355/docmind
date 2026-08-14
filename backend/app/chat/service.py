import json
from sqlalchemy.orm import Session
from app.models import Document, ChatMessage
from app.rag.embeddings import get_embeddings_model
from app.rag.vectorstore import search_chunks
from app.rag.llm import get_llm, get_rag_prompt
from app.config import get_settings

settings = get_settings()

def get_confidence_level(score: float) -> str:
    if score >= 0.7:
        return "high"
    if score >= settings.CONFIDENCE_THRESHOLD:
        return "medium"
    return "low"

def query_document_stream(db: Session, user_id: str, document: Document, question: str):
    embeddings_model = get_embeddings_model()
    query_embedding = embeddings_model.embed_query(question)
    
    chunks = search_chunks(
        user_id=user_id,
        document_id=document.id,
        query_embedding=query_embedding,
    )
    
    if not chunks or chunks[0]["score"] < settings.CONFIDENCE_THRESHOLD:
        answer = "I don't know the answer based on the provided document. The question doesn't seem to match any content in the PDF."
        
        yield f"data: {json.dumps({'sources': [], 'confidence': 'none'})}\n\n"
        yield f"data: {json.dumps({'token': answer})}\n\n"
        
        user_msg = ChatMessage(user_id=user_id, document_id=document.id, role="user", content=question)
        assistant_msg = ChatMessage(
            user_id=user_id,
            document_id=document.id,
            role="assistant",
            content=answer,
            sources=[]
        )
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
        return

    context_parts = []
    sources = []
    
    for i, chunk in enumerate(chunks):
        source_index = i + 1
        context_parts.append(f"[{source_index}] (Page {chunk['page_number']}):\n{chunk['text']}")
        sources.append({
            "chunk_index": chunk["chunk_index"],
            "page_number": chunk["page_number"],
            "text": chunk["text"],
            "score": chunk["score"],
        })
        
    context = "\n\n".join(context_parts)
    prompt = get_rag_prompt()
    llm = get_llm()
    chain = prompt | llm
    
    confidence = get_confidence_level(chunks[0]["score"])
    
    yield f"data: {json.dumps({'sources': sources, 'confidence': confidence})}\n\n"
    
    full_answer = ""
    try:
        for chunk in chain.stream({"context": context, "question": question}):
            token = chunk.content
            if token:
                full_answer += token
                yield f"data: {json.dumps({'token': token})}\n\n"
    finally:
        user_msg = ChatMessage(user_id=user_id, document_id=document.id, role="user", content=question)
        assistant_msg = ChatMessage(
            user_id=user_id,
            document_id=document.id,
            role="assistant",
            content=full_answer,
            sources=[s.model_dump() if hasattr(s, 'model_dump') else s for s in sources]
        )
        db.add(user_msg)
        db.add(assistant_msg)
        db.commit()
