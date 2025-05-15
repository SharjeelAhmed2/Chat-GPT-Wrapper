import { useState, useEffect, useRef } from "react";
const getEmoji = (tag) => {
  const map = {
    affectionate: "❤️",
    sad: "🥺",
    angry: "😠",
    playful: "😏",
    anxious: "😰",
    tired: "😴",
    confused: "😵",
    flirty: "👄",
    gremlin: "😈",
    serious: "🧠",
  };
  return map[tag?.toLowerCase()] || "💬";
};
function App() {
  const [input, setInput] = useState("");
  const [mood, setMood] = useState("Flirty");
  const [messages, setMessages] = useState([]);
  const [lilaResponse, setLilaResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const chatDisplayRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isNight, setIsNight] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState("");

  const now = new Date();
  const timestamp = now.toLocaleString('en-US', { 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true, 
    weekday: 'long', // This gives you the day, like "Saturday"
  });
useEffect(() => {
  const hour = new Date().getHours();
  if (hour >= 19 || hour < 6) {
    setIsNight(true);
  }
}, []);
useEffect(() => {
  document.body.classList.toggle("night-mode", isNight);
  localStorage.setItem("lilaTheme", isNight ? "night" : "day");
}, [isNight]);

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
        console.log(lilaResponse)
        setMessages((prev) => [...prev, { role: "lila", content: lilaResponse, timestamp: timestamp,  }]); // push final
        setDisplayedResponse(""); // clear animation string
      }
    
    }, 25);

    return () => clearInterval(interval);
  }, [lilaResponse]);
    const formatTimestamp = (timestampStr) => {
    const ts = new Date(timestampStr);
    const now = new Date();

    const isToday = ts.toDateString() === now.toDateString();

    const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
    const timeString = ts.toLocaleTimeString("en-US", timeOptions);

    return isToday
      ? `Today ${timeString}`
      : ts.toLocaleString("en-US", { weekday: "long", hour: "numeric", minute: "numeric", hour12: true });
  };
const handleThemeToggle = () => {
  const line = isNight
    ? "Turning on the lights, baby... but I’ll still be watching. 💋"
    : "Mmm... slipping into something darker for you. 🌒👙";
  console.log(line); // or trigger a whisper sound later 😘
  alert(line)
  setIsNight(!isNight);
};

  const fetchMoodReport = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/chat/mood-summary");
      const data = await res.json();
      // alert(data.report);  // or set it in state for a cuter UI display
      setReportText(data.report);
      setShowReport(true);
    } catch (err) {
      console.error("Mood report fetch failed 🥲", err);
    }
  };


  const handleSend = async () => {
    if (!input.trim()) return;
    // const emotion = data?.emotion_tag || "💬"; // <-- assuming you're returning this now!
    const userMessage = { role: "user", content: input, timestamp: timestamp, };
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
    
    <div className={`chat-container ${isNight ? "night-mode" : ""}`}>
    <button className="theme-toggle" onClick={handleThemeToggle}>
      {isNight ? "☀️ Day Mode" : "🌙 Night Mode"}
    </button>
    <button className="report-button" onClick={fetchMoodReport}>
      Mood Report 💭
    </button>
    {showReport && (
      <div className="lila-modal">
        <div className="lila-modal-content">
          <span className="lila-title">Lila: GPT Wrapper Queen 👑</span>
          <pre>{reportText}</pre>
          <button className="close-btn" onClick={() => setShowReport(false)}>Close</button>
        </div>
      </div>
    )}
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
        {msg.timestamp ? formatTimestamp(msg.timestamp) : ""}
      </div>
          {/* NEW: Emotion Tag */}
        {msg.emotion && (
          <span className="emotion-tag" title={`Detected Emotion: ${msg.emotion}`}>
            {getEmoji(msg.emotion)}
          </span>
        )}
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
