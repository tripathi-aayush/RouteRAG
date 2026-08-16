import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.models import BusinessDocument
from backend.db import get_db

router = APIRouter()

@router.post("/api/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    doc = BusinessDocument(
        source_type="upload",
        title=file.filename,
        raw_content=content.decode("utf-8"),
        metadata_json={}
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"document_id": doc.id, "title": doc.title}
