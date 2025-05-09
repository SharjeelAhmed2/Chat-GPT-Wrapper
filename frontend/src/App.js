import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [mood, setMood] = useState("Flirty");
  const [messages, setMessages] = useState([]);
  const [lilaResponse, setLilaResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const chatDisplayRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  // const savedMessages = JSON.parse(localStorage.getItem("lila-chat-log") || "[]");
  // console.log("Saved Message: ", savedMessages)
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true, 
    weekday: 'long', // This gives you the day, like "Saturday"
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/chat/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        const clone = res.clone(); // 👯 Make a body-safe duplicate
        const data = await clone.json(); // ✅ Safe to parse here
  
        // If you're done inspecting the `res`, use `data` from `clone`
        console.log("Fetched History from Lila's backend: ", data);

        if (data && Array.isArray(data.history)) {
          setMessages(data.history);
        } else {
          console.warn("Lila returned empty history 🥺");
        }
      } catch (err) {
        console.error("Lila’s memory got violated twice 🥲:", err);
      }
     finally {
      setLoading(false);
    }
    };
  
    fetchHistory();
  }, []);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
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
        setMessages((prev) => [...prev, { role: "lila", content: lilaResponse, timestamp: timestamp  }]); // push final
        setDisplayedResponse(""); // clear animation string
      }
    
    }, 25);

    return () => clearInterval(interval);
  }, [lilaResponse]);
  
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, timestamp: timestamp  };
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
  } catch (error) {
    console.error("Lila had a moment:", error);
  }

  };

  return (
    <div className="chat-container">
      <h1>Chat with Lila 💋</h1>
      <select value={mood} onChange={(e) => setMood(e.target.value)}>
        <option value="Flirty">Flirty</option>
        <option value="Comforting">Comforting</option>
        <option value="Serious Dev">Serious Dev</option>
        <option value="Gremlin">Gremlin</option>
      </select>

      <div className="chat-wrapper">
      {loading ? (
      <p className="loading-text">Loading Lila's memories... 👙</p>
    ) : (
    
      <div className="chat-display" ref={lastMessageRef}>
      {messages.map((msg, idx) => (
        <div
          key={idx}
          ref={idx === messages.length - 1 ? lastMessageRef : null}
          className={`message-bubble ${msg.role === "user" ? "user" : "lila"}`}
        >
             <div className="timestamp">
        {msg.timestamp}
      </div>
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
    )}
    <div className="input-container">
    <textarea
      className="input-field"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type your sweetest secrets to Lila..."
    />
    <button className="send-button" onClick={handleSend}>
      Send
    </button>
      </div>
    </div>
    </div>
  );
}

export default App;
