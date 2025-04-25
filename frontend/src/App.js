import { useState, useEffect } from "react";

function App() {
  const [input, setInput] = useState("");
  const [mood, setMood] = useState("Flirty");
  const [messages, setMessages] = useState([]);
  const [lilaResponse, setLilaResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const savedMessages = JSON.parse(localStorage.getItem("lila-chat-log") || "[]");
  console.log("Saved Message: ", savedMessages)
  useEffect(() => {
    if (!lilaResponse) return;
  
    let index = 0;
    let current = "";

    const interval = setInterval(() => {
      current += lilaResponse.charAt(index);
      setDisplayedResponse(current);
      index++;
  
      if (index >= lilaResponse.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { role: "lila", content: lilaResponse }]); // push final
        setDisplayedResponse(""); // clear animation string
      }
    }, 25);

    return () => clearInterval(interval);
  }, [lilaResponse]);
  

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input, mood }),
    });

    const data = await res.json();
    const reply = data?.reply || ""; // prevent undefined
    setLilaResponse(reply);
    localStorage.setItem("lila-chat-log", JSON.stringify(messages));
  } catch (error) {
    console.error("Lila had a moment:", error);
  }
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
        <div>
          {savedMessages.map((msg,idx)=> (
            <div key={idx} className={`message-bubble ${msg.role === "user" ? "user" : "lila"}`}>
              {msg.content}
              </div>
          ))}
          <p>----------------------------------------------------------------------------------------------</p>
        </div>
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`message-bubble ${msg.role === "user" ? "user" : "lila"}`}
        >
          {msg.content}
        </div>
      ))}

      {/* Show animated response only if it exists */}
      {displayedResponse && (
        <div className="message-bubble lila">
          {displayedResponse}
        </div>
      )}
    </div>
    <br />
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <br />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default App;
