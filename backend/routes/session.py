from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.models import ChatSession, Message, SessionSummary
from backend.db import get_db

router = APIRouter()

@router.get("/api/session/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(Message).filter(Message.session_id == session_id).all()
    summary = db.query(SessionSummary).filter(SessionSummary.session_id == session_id).first()
    return {
        "session": {
            "id": session.id,
            "title": session.title,
            "created_at": session.created_at,
            "updated_at": session.updated_at,
        },
        "messages": [
            {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at} for m in messages
        ],
        "summary": summary.summary if summary else None
    }

@router.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
    return [
        {"id": s.id, "title": s.title, "created_at": s.created_at, "updated_at": s.updated_at} for s in sessions
    ]

