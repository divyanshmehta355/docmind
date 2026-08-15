import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
)
from app.config import get_settings

settings = get_settings()
_client: QdrantClient | None = None


def get_qdrant_client() -> QdrantClient:
    global _client
    if _client is None:
        if settings.QDRANT_URL and settings.QDRANT_API_KEY:
            _client = QdrantClient(
                url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY, timeout=60.0
            )
        else:
            _client = QdrantClient(location=":memory:")
    return _client


def init_collection():
    client = get_qdrant_client()
    collections = [c.name for c in client.get_collections().collections]

    if settings.QDRANT_COLLECTION_NAME not in collections:
        client.create_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=settings.EMBEDDING_DIMENSION, distance=Distance.COSINE
            ),
        )
        client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            field_name="user_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            field_name="document_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )


def store_chunks(
    user_id: str, document_id: str, chunks: list[dict], embeddings: list[list[float]]
):
    client = get_qdrant_client()
    points = []

    for chunk, embedding in zip(chunks, embeddings):
        point = PointStruct(
            id=uuid.uuid4().hex,
            vector=embedding,
            payload={
                "user_id": user_id,
                "document_id": document_id,
                "chunk_index": chunk["chunk_index"],
                "page_number": chunk["page_number"],
                "text": chunk["text"],
            },
        )
        points.append(point)

    batch_size = 100
    for i in range(0, len(points), batch_size):
        client.upsert(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points=points[i : i + batch_size],
        )


def search_chunks(
    user_id: str,
    document_id: str,
    query_embedding: list[float],
    top_k: int | None = None,
) -> list[dict]:
    client = get_qdrant_client()
    top_k = top_k or settings.RETRIEVAL_TOP_K

    results = client.query_points(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        query=query_embedding,
        query_filter=Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="document_id", match=MatchValue(value=document_id)),
            ]
        ),
        limit=top_k,
        with_payload=True,
    )

    return [
        {
            "chunk_index": point.payload["chunk_index"],
            "page_number": point.payload["page_number"],
            "text": point.payload["text"],
            "score": point.score,
        }
        for point in results.points
    ]


def delete_document_chunks(user_id: str, document_id: str):
    client = get_qdrant_client()
    client.delete(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                FieldCondition(key="document_id", match=MatchValue(value=document_id)),
            ]
        ),
    )
