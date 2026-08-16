# Document chunking utility for RouteRAG
import re
from typing import List

CHUNK_SIZE = 500  # characters


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
    """Splits text into chunks of approximately chunk_size characters."""
    # Simple split by sentences, then group into chunks
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    current = ''
    for sentence in sentences:
        if len(current) + len(sentence) < chunk_size:
            current += ' ' + sentence if current else sentence
        else:
            if current:
                chunks.append(current)
            current = sentence
    if current:
        chunks.append(current)
    return chunks

if __name__ == "__main__":
    sample = "This is a test document. It has several sentences. This is to test chunking."
    for i, chunk in enumerate(chunk_text(sample)):
        print(f"Chunk {i+1}: {chunk}")

