from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.services.ai_service import ai_safety_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=ChatResponse)
def query_ai_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Route to process safety queries using worksite databases and Google Gemini.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Empty query message.")
        
    try:
        response_text = ai_safety_service.query_assistant(db, request.message)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
