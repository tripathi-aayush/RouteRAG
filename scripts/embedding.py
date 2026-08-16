# Embedding utility for RouteRAG (Gemini text-embedding-004 example)
import os
from typing import List
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def get_gemini_embedding(text: str, model: str = "models/text-embedding-004") -> List[float]:
    embeddings = GoogleGenerativeAIEmbeddings(
        model=model,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )
    return embeddings.embed_query(text)

if __name__ == "__main__":
    sample = "This is a test chunk."
    emb = get_gemini_embedding(sample)
    print(f"Generated embedding with dimension: {len(emb)}")
