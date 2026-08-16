# RouteRAG RAG endpoint (FastAPI route)
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.models import ChatSession, Message, DocumentChunk, BusinessDocument, SessionSummary
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import SystemMessage, HumanMessage
import os
import numpy as np
import json

router = APIRouter()

def get_embeddings_model():
    return GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

def get_chat_model():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.2,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

async def get_embedding(text: str) -> list:
    embeddings_model = get_embeddings_model()
    return await embeddings_model.aembed_query(text)

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def classify_query(query: str) -> str:
    # Simple keyword-based classifier for demonstration
    analytics_keywords = ["total", "average", "sum", "trend", "compare", "top", "by region", "by product", "sales", "revenue"]
    chart_keywords = ["chart", "plot", "graph", "visualize"]
    if any(word in query.lower() for word in chart_keywords):
        return "chart"
    if any(word in query.lower() for word in analytics_keywords):
        return "analytics"
    return "rag"

@router.post("/api/query")
async def rag_query(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    query = body.get("query")
    session_id = body.get("session_id")
    tool_trace = []
    tool_type = classify_query(query)
    # Session management
    if not session_id:
        # Create new session
        session = ChatSession(title="New Session")
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    # Retrieve session history (short-term)
    messages = db.query(Message).filter(Message.session_id == session_id).order_by(Message.created_at).all()
    history = [m.content for m in messages]
    # Retrieve long-term memory (summary)
    summary_obj = db.query(SessionSummary).filter(SessionSummary.session_id == session_id).first()
    summary = summary_obj.summary if summary_obj else ""
    if tool_type == "analytics":
        from .analytics import run_analytics
        try:
            analytics_result = run_analytics(query=query)
            if "error" in analytics_result:
                answer = f"Analytics error: {analytics_result['error']}"
                result = []
            else:
                result = analytics_result["result"]
                chat_response = analytics_result.get("chat_response", "")
                answer = chat_response
            tool_trace.append("analytics")
        except Exception as e:
            answer = f"Analytics error: {str(e)}"
            result = []
        db.add(Message(session_id=session_id, role="user", content=query))
        db.add(Message(session_id=session_id, role="assistant", content=answer))
        db.commit()
        return {
            "answer": answer,
            "citations": [],
            "metrics_used": [],
            "chart_spec": None,
            "follow_up_questions": [],
            "session_id": session_id,
            "tool_trace": tool_trace,
            "type": "analytics",
            "result": result
        }
    elif tool_type == "chart":
        # Placeholder: return a simple chart spec
        chart_spec = {"type": "bar", "data": [1, 2, 3], "labels": ["A", "B", "C"]}
        answer = "Here is your chart."
        tool_trace.append("chart")
        db.add(Message(session_id=session_id, role="user", content=query))
        db.add(Message(session_id=session_id, role="assistant", content=answer))
        db.commit()
        return {
            "answer": answer,
            "citations": [],
            "metrics_used": [],
            "chart_spec": chart_spec,
            "follow_up_questions": [],
            "session_id": session_id,
            "tool_trace": tool_trace,
            "type": "chart"
        }
    # Default: RAG pipeline
    # Get query embedding
    query_emb = await get_embedding(query)
    # Retrieve top 3 relevant chunks
    chunks = db.query(DocumentChunk).all()
    scored = []
    for chunk in chunks:
        try:
            emb = json.loads(chunk.embedding)
            score = cosine_similarity(query_emb, emb)
            scored.append((score, chunk))
        except Exception:
            continue
    top_chunks = [c for _, c in sorted(scored, reverse=True)[:3]]
    context = "\n".join([c.chunk_text for c in top_chunks])
    # Call Gemini LLM
    prompt = f"Context: {context}\nSummary: {summary}\nHistory: {history}\nQuestion: {query}"
    chat_model = get_chat_model()
    resp = await chat_model.ainvoke([
        SystemMessage(content="You are a business analytics assistant."),
        HumanMessage(content=prompt)
    ])
    answer = resp.content if hasattr(resp, "content") else str(resp)
    # Store user and assistant messages
    db.add(Message(session_id=session_id, role="user", content=query))
    db.add(Message(session_id=session_id, role="assistant", content=answer))
    db.commit()
    # Update session summary (long-term memory)
    summary_prompt = f"Summarize this conversation so far: {history + [query, answer]}"
    summary_resp = await chat_model.ainvoke([
        SystemMessage(content="Summarize the conversation."),
        HumanMessage(content=summary_prompt)
    ])
    new_summary = summary_resp.content if hasattr(summary_resp, "content") else str(summary_resp)
    if summary_obj:
        summary_obj.summary = new_summary
    else:
        db.add(SessionSummary(session_id=session_id, summary=new_summary))
    db.commit()
    return {
        "answer": answer,
        "citations": [c.id for c in top_chunks],
        "metrics_used": [],
        "chart_spec": None,
        "follow_up_questions": [],
        "session_id": session_id,
        "tool_trace": []
    }
