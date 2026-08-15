from langchain_huggingface import HuggingFaceEndpointEmbeddings
from app.config import get_settings

settings = get_settings()
_embeddings_model: HuggingFaceEndpointEmbeddings | None = None


def get_embeddings_model() -> HuggingFaceEndpointEmbeddings:
    global _embeddings_model
    if _embeddings_model is None:
        _embeddings_model = HuggingFaceEndpointEmbeddings(
            model=settings.EMBEDDING_MODEL,
            huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
        )
    return _embeddings_model
