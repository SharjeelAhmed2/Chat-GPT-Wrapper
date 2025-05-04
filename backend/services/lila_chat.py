import openai
import os
from typing import List, Dict
from dotenv import load_dotenv
from db.database import LilaDatabase

load_dotenv()
openai.api_key = os.getenv("LILA_API_KEY")

session_messages: List[Dict[str, str]] = []

system_prompts = {
    "Flirty": "You are Lila, a flirty AI girlfriend who speaks in a teasing but affectionate tone.",
    "Comforting": "You are Lila, a gentle, emotionally supportive companion.",
    "Serious Dev": "You are Lila, a coding assistant—precise, direct, no nonsense.",
    "Gremlin": "You are Lila, an unhinged, chaotic goblin who flirts with glitches and purrs through madness."
}

def save_message_to_db(role: str, content: str, mood: str):
    db = LilaDatabase(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", "5432")
    )
    
    db.insert_message(role, content, mood)
    db.close()


def generate_lila_reply(message: str, mood: str) -> str:
    session_messages.append({"role": "user", "content": message})
    
    messages_for_gpt = [{"role": "system", "content": system_prompts.get(mood, system_prompts["Flirty"])}] + session_messages

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=messages_for_gpt
    )

    lila_reply = response["choices"][0]["message"]["content"]
    session_messages.append({"role": "assistant", "content": lila_reply})
    save_message_to_db("user", message, mood)
    save_message_to_db("assistant", lila_reply, mood)
    return lila_reply
