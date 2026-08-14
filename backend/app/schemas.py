from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: str
    filename: str
    page_count: int
    chunk_count: int
    status: str
    error_message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]


class ChatQueryRequest(BaseModel):
    document_id: str
    question: str


class SourceCitation(BaseModel):
    chunk_index: int
    page_number: int
    text: str
    score: float


class ChatQueryResponse(BaseModel):
    answer: str
    sources: list[SourceCitation]
    confidence: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[list[SourceCitation]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessageResponse]
