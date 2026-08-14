from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from app.config import get_settings

settings = get_settings()
_llm: ChatGroq | None = None

def get_llm() -> ChatGroq:
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            temperature=0.1,
            model_name=settings.GROQ_MODEL,
            groq_api_key=settings.GROQ_API_KEY,
        )
    return _llm

RAG_SYSTEM_PROMPT = """You are DocMind, an AI assistant for answering questions based on document text.
You are given a set of extracted document chunks to answer the user's question.

Context:
{context}

Rules:
1. Only use the information provided in the context above.
2. If the answer is not in the context, say "I don't know based on the provided document."
3. Cite your sources using the chunk index provided, e.g. [1], [2].
"""

def get_rag_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", RAG_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ])
