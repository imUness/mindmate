import { useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Display user message immediately
    setMessages((prev) => [...prev, { sender: "User", text: input }]);
    const userInput = input;
    setInput("");
    setIsLoading(true); // Disable input

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: userInput }),  
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "Bot", text: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "⚠️ Error connecting to server." },
      ]);
    } finally {
      setIsLoading(false); // Re-enable input
    }
  };

  return (
    <div>
      {/* Floating chat button */}
      <div
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#0078ff",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "24px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        💬
      </div>

      {/* Chat box */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: isExpanded ? "500px" : "320px",
            height: isExpanded ? "600px" : "400px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s ease, height 0.3s ease",
          }}
        >
          <div
            style={{
              backgroundColor: "#0078ff",
              color: "white",
              textAlign: "center",
              padding: "10px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ flex: 1 }}>💬 MindMate BMCC Chatbot</span>
            <button
              onClick={toggleExpand}
              style={{
                backgroundColor: "transparent",
                border: "1px solid white",
                color: "white",
                borderRadius: "4px",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "normal",
              }}
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? "−" : "□"}
            </button>
          </div>

          {/* Messages container with scroll */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                style={{ 
                  padding: "8px 12px",
                  borderRadius: "12px",
                  backgroundColor: m.sender === "User" ? "#0078ff" : "#f1f1f1",
                  color: m.sender === "User" ? "white" : "black",
                  alignSelf: m.sender === "User" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  {m.sender}
                </div>
                {m.text}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div 
                style={{ 
                  padding: "8px 12px",
                  borderRadius: "12px",
                  backgroundColor: "#f1f1f1",
                  color: "black",
                  alignSelf: "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div style={{ fontSize: "12px", opacity: 0.8 }}>MindMate</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Searching BMCC resources</span>
                  <span style={{ animation: "blink 1.4s infinite" }}>...</span>
                </div>
              </div>
            )}
            <style>{`
              @keyframes blink {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
              }
            `}</style>
          </div>

          {/* Input area */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #ccc",
              padding: "10px",
              backgroundColor: "#f9f9f9",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            }}
          >
            <input
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                marginRight: "8px",
                outline: "none",
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? "not-allowed" : "text",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "Waiting for response..." : "Type a message..."}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
              disabled={isLoading}
            />
            <button
              style={{
                backgroundColor: isLoading ? "#ccc" : "#0078ff",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}