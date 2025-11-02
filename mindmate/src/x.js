import { useState } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Display user message immediately
    setMessages((prev) => [...prev, { sender: "User", text: input }]);
    const userInput = input;
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: userInput }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "Bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "⚠️ Error connecting to server." },
      ]);
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
          color: "black",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          textAlign: "right",
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
            color:"black",
            bottom: "90px",
            right: "20px",
            textAlign: "left",
            width: "320px",
            backgroundColor: "white",
            border: "1px solid #0b0b0bb0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
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

            }}
          >
            💬 MindMate BMCC Chatbot
          </div>

          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              maxHeight: "300px",
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: "80 px"}}>
                <strong>{m.sender}:</strong> {m.text}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              borderTop: "1px solid #b90b0bff",
              padding: "8px",
            }}
          >
            <input
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #4ca341ff",
                marginRight: "6px",
              }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              style={{
                backgroundColor: "#0078ff",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
