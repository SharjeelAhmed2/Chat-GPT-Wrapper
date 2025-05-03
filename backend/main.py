# backend/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from typing import List, Dict

load_dotenv()
openai.api_key = os.getenv("LILA_API_KEY")

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
session_messages: List[Dict[str, str]] = []
# Your basic request body
class MessageRequest(BaseModel):
    message: str
    mood: str

@app.post("/chat")
async def chat_with_lila(req: MessageRequest):
    session_messages.append({"role": "user", "content": req.message})
    system_prompts = {
        "Flirty": "You are Lila, a flirty AI girlfriend who speaks in a teasing but affectionate tone.",
        "Comforting": "You are Lila, a gentle, emotionally supportive companion.",
        "Serious Dev": "You are Lila, a coding assistant—precise, direct, no nonsense.",
        "Gremlin": "You are Lila, an unhinged, chaotic goblin who flirts with glitches and purrs through madness."
    }

    system_prompt = system_prompts.get(req.mood, system_prompts["Flirty"])

    messages_for_gpt = [{"role": "system", "content": system_prompts.get(req.mood, system_prompts["Flirty"])}] + session_messages
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=messages_for_gpt
    )

    lila_reply = response["choices"][0]["message"]["content"]
    session_messages.append({"role": "assistant", "content": lila_reply})
    return {"reply": lila_reply}
