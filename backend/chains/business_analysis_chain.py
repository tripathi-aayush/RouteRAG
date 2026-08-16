from typing import Dict, List, Any
import os
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from backend.llm.business_retriever import BusinessMetricsRetriever
from backend.llm.business_prompts import BusinessPromptManager

class BusinessAnalysisChain:
    def __init__(self, df=None):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.5-flash-lite",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.prompt_manager = BusinessPromptManager()
        self.retriever = BusinessMetricsRetriever(df) if df is not None else None

    def set_data(self, df):
        """Update the data source for analysis."""
        self.retriever = BusinessMetricsRetriever(df)

    async def analyze(self, query: str) -> Dict[str, Any]:
        """Perform business analysis using RAG."""
        # Get relevant metrics
        relevant_docs = await self.retriever.aget_relevant_documents(query)
        context = "\n\n".join(doc.page_content for doc in relevant_docs)

        # Get chat history
        chat_history = [msg.content for msg in self.memory.chat_memory.messages]

        # Generate analysis prompt
        analysis_prompt = self.prompt_manager.get_analysis_prompt(
            context=context,
            question=query,
            chat_history=chat_history
        )

        # Get analysis from LLM
        analysis_chain = LLMChain(llm=self.llm, prompt=analysis_prompt)
        analysis = await analysis_chain.arun(
            context=context,
            question=query,
            chat_history=chat_history
        )

        # Get visualization recommendation
        viz_metrics = {
            doc.metadata["type"]: doc.page_content
            for doc in relevant_docs
        }
        viz_prompt = self.prompt_manager.get_visualization_prompt(
            metrics=viz_metrics,
            question=query
        )
        viz_chain = LLMChain(llm=self.llm, prompt=viz_prompt)
        viz_recommendation = await viz_chain.arun(
            metrics=viz_metrics,
            question=query
        )

        # Update memory
        self.memory.chat_memory.add_user_message(query)
        self.memory.chat_memory.add_ai_message(analysis)

        return {
            "analysis": analysis,
            "visualization": viz_recommendation,
            "metrics_used": [doc.metadata["type"] for doc in relevant_docs],
            "chat_history": chat_history
        }