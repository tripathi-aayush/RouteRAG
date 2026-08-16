import numpy as np
import pandas as pd
from typing import List, Dict, Any
import json

def chunk_data(df: pd.DataFrame, chunk_size: int = 100) -> List[str]:
    """Split data into meaningful chunks for embedding."""
    chunks = []

    # Chunk by category
    for category in df['Category'].unique():
        category_data = df[df['Category'] == category]
        summary = f"Category: {category}\n"
        summary += f"Total Revenue: ${category_data['Revenue'].sum():,.2f}\n"
        summary += f"Total Units: {category_data['Units_Sold'].sum():,}\n"
        summary += f"Products: {', '.join(category_data['Product'].unique())}\n"
        chunks.append(summary)

    # Chunk by region
    for region in df['Region'].unique():
        region_data = df[df['Region'] == region]
        summary = f"Region: {region}\n"
        summary += f"Total Revenue: ${region_data['Revenue'].sum():,.2f}\n"
        summary += f"Total Units: {region_data['Units_Sold'].sum():,}\n"
        summary += f"Categories: {', '.join(region_data['Category'].unique())}\n"
        chunks.append(summary)

    # Chunk by time periods
    df['Date'] = pd.to_datetime(df['Date'])
    for date in df['Date'].unique():
        date_data = df[df['Date'] == date]
        summary = f"Date: {date.strftime('%Y-%m-%d')}\n"
        summary += f"Total Revenue: ${date_data['Revenue'].sum():,.2f}\n"
        summary += f"Total Units: {date_data['Units_Sold'].sum():,}\n"
        summary += f"Active Categories: {', '.join(date_data['Category'].unique())}\n"
        chunks.append(summary)

    # Product performance chunks
    for product in df['Product'].unique():
        product_data = df[df['Product'] == product]
        summary = f"Product: {product}\n"
        summary += f"Category: {product_data['Category'].iloc[0]}\n"
        summary += f"Total Revenue: ${product_data['Revenue'].sum():,.2f}\n"
        summary += f"Total Units: {product_data['Units_Sold'].sum():,}\n"
        summary += f"Regions: {', '.join(product_data['Region'].unique())}\n"
        chunks.append(summary)

    return chunks

def create_metadata(df: pd.DataFrame) -> Dict[str, Any]:
    """Create metadata about the dataset for context."""
    return {
        "time_range": {
            "start": df['Date'].min(),
            "end": df['Date'].max()
        },
        "categories": df['Category'].unique().tolist(),
        "regions": df['Region'].unique().tolist(),
        "products": df['Product'].unique().tolist(),
        "metrics": {
            "total_revenue": df['Revenue'].sum(),
            "total_units": df['Units_Sold'].sum(),
            "avg_order_value": df['Revenue'].mean()
        }
    }

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors."""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def find_relevant_chunks(query_embedding: np.ndarray, chunk_embeddings: List[Dict[str, Any]],
                        top_k: int = 3) -> List[Dict[str, Any]]:
    """Find the most relevant chunks for a query."""
    scored_chunks = [
        (cosine_similarity(query_embedding, np.array(chunk['embedding'])), chunk)
        for chunk in chunk_embeddings
    ]
    return [chunk for _, chunk in sorted(scored_chunks, reverse=True)[:top_k]]