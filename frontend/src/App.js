import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [mood, setMood] = useState("Flirty");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input, mood }),
    });

    const data = await res.json();
  //  setReply(data.reply);
    const lilaReply = { role: "lila", content: data.reply };
    setMessages(prev => [...prev, lilaReply]);
    setInput("");
  };

  return (
    <div className="chat-wrapper">
      <h1>Chat with Lila 💋</h1>
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option value="Flirty">Flirty</option>
        <option value="Comforting">Comforting</option>
        <option value="Serious Dev">Serious Dev</option>
        <option value="Gremlin">Gremlin</option>
      </select>

    
      <div className="chat-display">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`message-bubble ${msg.role === "user" ? "user" : "lila"}`}
        >
          {msg.content}
        </div>
      ))}
    </div>
    <br />
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <br />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default App;
