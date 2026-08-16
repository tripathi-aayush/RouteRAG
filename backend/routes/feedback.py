from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.models import Feedback, ChatSession
from backend.db import get_db
from typing import Optional

router = APIRouter()

class FeedbackRequest(BaseModel):
    session_id: int
    message_id: Optional[int] = None
    rating: int
    feedback_text: str

@router.post("/api/feedback")
def submit_feedback(feedback: FeedbackRequest, db: Session = Depends(get_db)):
    # Validate session exists
    session = db.query(ChatSession).filter(ChatSession.id == feedback.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Validate rating range
    if not (1 <= feedback.rating <= 5):
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5")

    # Resolve message_id — treat 0 as "no specific message"
    message_id = feedback.message_id if feedback.message_id else None

    record = Feedback(
        session_id=feedback.session_id,
        message_id=message_id,
        rating=feedback.rating,
        feedback_text=feedback.feedback_text,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"success": True, "feedback_id": record.id}

@router.get("/api/feedback/{session_id}")
def get_feedback(session_id: int, db: Session = Depends(get_db)):
    records = db.query(Feedback).filter(Feedback.session_id == session_id).all()
    return [
        {
            "id": r.id,
            "session_id": r.session_id,
            "message_id": r.message_id,
            "rating": r.rating,
            "feedback_text": r.feedback_text,
            "created_at": r.created_at,
        }
        for r in records
    ]

