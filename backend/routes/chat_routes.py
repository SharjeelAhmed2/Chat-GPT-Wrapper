from fastapi import APIRouter
from models.message import MessageRequest
from services.lila_chat import generate_lila_reply

router = APIRouter()

@router.post("/chat")
async def chat_with_lila(req: MessageRequest):
    reply = generate_lila_reply(req.message, req.mood)
    return {"reply": reply}
