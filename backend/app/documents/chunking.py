from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import get_settings

settings = get_settings()


def chunk_document(pages: list[dict]) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )

    chunks = []
    chunk_index = 0

    for page in pages:
        page_text = page["text"].strip()
        if not page_text:
            continue

        splits = splitter.split_text(page_text)
        for split in splits:
            chunks.append(
                {
                    "text": split,
                    "page_number": page["page_number"],
                    "chunk_index": chunk_index,
                }
            )
            chunk_index += 1

    return chunks
