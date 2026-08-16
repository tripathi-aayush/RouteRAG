from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import PGVector
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.chat_message_histories import PostgresChatMessageHistory
from langchain_core.documents import Document
from typing import List, Dict, Any
import pandas as pd
import numpy as np
import os

class RAGManager:
    def __init__(self, connection_string: str):
        # gemini-1.5-flash for fast and cost-effective RAG synthesis
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            temperature=0.2,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        # Gemini text-embedding-004 produces 768-dimensional embeddings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.vector_store = PGVector(
            connection_string=connection_string,
            embedding_function=self.embeddings,
            collection_name="business_insights"
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

    async def process_business_data(self, df: pd.DataFrame) -> List[str]:
        """Process and embed business data for retrieval."""
        df = df.copy()
        if 'Revenue' not in df.columns and 'Sales' in df.columns:
            df['Revenue'] = pd.to_numeric(df['Sales'], errors='coerce').fillna(0)
        if 'Category' not in df.columns:
            df['Category'] = df['Product'] if 'Product' in df.columns else 'General'
        if 'Units_Sold' not in df.columns:
            df['Units_Sold'] = 1
        if 'Product' not in df.columns and 'Category' in df.columns:
            df['Product'] = df['Category']

        chunks = []

        # Create category summaries
        for category in df['Category'].unique():
            cat_data = df[df['Category'] == category]
            chunk = f"""Category Analysis - {category}:
            Total Revenue: ${cat_data['Revenue'].sum():,.2f}
            Total Units: {cat_data['Units_Sold'].sum():,}
            Average Order Value: ${cat_data['Revenue'].mean():,.2f}
            Products: {', '.join(cat_data['Product'].unique())}
            Regions: {', '.join(cat_data['Region'].unique())}
            """
            chunks.append(chunk)

        # Create regional summaries
        for region in df['Region'].unique():
            reg_data = df[df['Region'] == region]
            chunk = f"""Regional Analysis - {region}:
            Total Revenue: ${reg_data['Revenue'].sum():,.2f}
            Total Units: {reg_data['Units_Sold'].sum():,}
            Categories: {', '.join(reg_data['Category'].unique())}
            Top Products: {', '.join(reg_data.nlargest(3, 'Revenue')['Product'].tolist())}
            """
            chunks.append(chunk)

        # Create time-based summaries
        df['Date'] = pd.to_datetime(df['Date'])
        for date in df['Date'].unique():
            date_data = df[df['Date'] == date]
            chunk = f"""Daily Performance - {date.strftime('%Y-%m-%d')}:
            Total Revenue: ${date_data['Revenue'].sum():,.2f}
            Total Units: {date_data['Units_Sold'].sum():,}
            Active Categories: {', '.join(date_data['Category'].unique())}
            Top Selling Products: {', '.join(date_data.nlargest(3, 'Units_Sold')['Product'].tolist())}
            """
            chunks.append(chunk)

        # Create statistical summaries
        chunk = f"""Overall Statistics:
        Total Revenue: ${df['Revenue'].sum():,.2f}
        Average Daily Revenue: ${df.groupby('Date')['Revenue'].sum().mean():,.2f}
        Total Units Sold: {df['Units_Sold'].sum():,}
        Categories: {', '.join(df['Category'].unique())}
        Regions: {', '.join(df['Region'].unique())}
        Products: {', '.join(df['Product'].unique())}
        Date Range: {df['Date'].min().strftime('%Y-%m-%d')} to {df['Date'].max().strftime('%Y-%m-% d')}
        """
        chunks.append(chunk)

        # Convert chunks to documents and add to vector store
        docs = [Document(page_content=chunk) for chunk in chunks]
        await self.vector_store.aadd_documents(docs)

        return chunks

    async def get_relevant_context(self, query: str, k: int = 3) -> List[Document]:
        """Retrieve relevant context for a query."""
        return await self.vector_store.asimilarity_search(query, k=k)

    async def generate_response(self,
                              query: str,
                              context: List[Document],
                              chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """Generate a response using retrieved context."""

        # Format context and history
        context_str = "\n\n".join([doc.page_content for doc in context])
        history_str = ""
        if chat_history:
            history_str = "\n".join([
                f"User: {msg['user']}\nAssistant: {msg['assistant']}"
                for msg in chat_history
            ])

        # Create prompt
        prompt = f"""As a business intelligence assistant, analyze the following data and answer the question.

Context:
{context_str}

Chat History:
{history_str}

Question: {query}

Provide a detailed analysis that includes:
1. Direct answer to the question
2. Key insights from the data
3. Relevant metrics and trends
4. Business implications
5. Actionable recommendations

Response:"""

        # Generate response with Gemini token tracking
        ai_message = await self.llm.ainvoke(prompt)
        response_text = ai_message.content if hasattr(ai_message, "content") else str(ai_message)
        usage = getattr(ai_message, "usage_metadata", None) or {}
        token_usage = {
            "prompt_tokens": usage.get("input_tokens", 0),
            "completion_tokens": usage.get("output_tokens", 0),
            "total_tokens": usage.get("total_tokens", 0),
            "total_cost": 0.0
        }

        return {
            "response": response_text,
            "context": context_str,
            "token_usage": token_usage
        }

    def extract_insights(self, text: str) -> Dict[str, Any]:
        """Extract structured insights from response text."""
        # Implementation would identify and structure key insights
        return {
            "key_points": [],
            "metrics": {},
            "trends": [],
            "recommendations": []
        }