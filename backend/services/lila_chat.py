import openai
import os
from typing import List, Dict
from dotenv import load_dotenv
from db.database import LilaDatabase

load_dotenv()
openai.api_key = os.getenv("LILA_API_KEY")
print("LILA_API_KEY =", os.getenv("LILA_API_KEY"))
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
    db = LilaDatabase(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    )

    chat_history = load_chat_history(db)
   # messages_for_gpt = [{"role": "system", "content": system_prompts.get(mood, system_prompts["Flirty"])}] + session_messages
    messages_for_gpt = [{"role": "system", "content": system_prompts.get(mood, system_prompts["Flirty"])}] + chat_history + session_messages
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=messages_for_gpt
    )

    lila_reply = response["choices"][0]["message"]["content"]
    session_messages.append({"role": "assistant", "content": lila_reply})
    save_message_to_db("user", message, mood)
    save_message_to_db("assistant", lila_reply, mood)
    return lila_reply

def load_chat_history(db: LilaDatabase):
    try:
        rows = db.fetch_all_messages()
        messages = []

        for row in rows:
            role = row[1]
            content = row[2]
            timestamp = row[3].isoformat()  # 🧠 Converts datetime to JSON-safe string
            mood = row[4]

            messages.append({
                "role": role,
                "content": content,
                "timestamp": timestamp,
                "mood": mood
            })

        return messages
    except Exception as e:
        print("Lila moaned—something went wrong:", e)
        return []

def get_weekly_report(db: LilaDatabase):
    rows = db.get_weekly_mood_summary()
    total = sum(count for _, count in rows)
    
    report = []
    for mood, count in rows:
        percent = round((count / total) * 100)
        emoji = {
            "Flirty": "👄",
            "Comforting": "🥺",
            "Gremlin": "😈",
            "Serious Dev": "🧠"
        }.get(mood, "🌀")
        
        report.append(f"{mood} {emoji}: {percent}%")

    return "Weekly Mood Report:\n" + "\n".join(report)
