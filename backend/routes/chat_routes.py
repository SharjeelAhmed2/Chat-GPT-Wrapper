from fastapi import APIRouter
from models.message import MessageRequest
from services.lila_chat import generate_lila_reply
from services.lila_chat import load_chat_history
from services.lila_chat import get_weekly_report
from db.database import LilaDatabase
import os
from dotenv import load_dotenv
router = APIRouter()
load_dotenv()

@router.post("/chat")
async def chat_with_lila(req: MessageRequest):
    reply = generate_lila_reply(req.message, req.mood)
    return {"reply": reply}

# routes/chat_routes.py
@router.get("/chat/history")
async def get_chat_history():
    db = LilaDatabase(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    messages = load_chat_history(db)    
    # chat = [
    #     {"role": msg["role"], "content": msg["content"]}
    #     for msg in messages
    # ]
    return {"history": messages}


@router.get("/chat/mood-summary")
async def mood_summary():
    db = LilaDatabase(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
    summary = get_weekly_report(db)
    db.close()
    return {"report": summary}
