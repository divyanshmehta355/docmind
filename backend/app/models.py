import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


def _new_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_new_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    documents = relationship(
        "Document", back_populates="owner", cascade="all, delete-orphan"
    )
    messages = relationship(
        "ChatMessage", back_populates="user", cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=_new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    page_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    status = Column(String, default="processing")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    owner = relationship("User", back_populates="documents")
    messages = relationship(
        "ChatMessage", back_populates="document", cascade="all, delete-orphan"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=_new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", back_populates="messages")
    document = relationship("Document", back_populates="messages")
