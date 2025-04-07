import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState(["Alice", "Bob", "Charlie"]);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && selectedMember) {
      const formattedMsg = `You to ${selectedMember}: ${message}`;
      setMessages((prevMessages) => [...prevMessages, formattedMsg]);
      socket.emit("message", `${selectedMember}: ${message}`);
      setMessage("");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Members */}
      <div
        style={{
          width: "25%",
          borderRight: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h3>Members</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {members.map((member, index) => (
            <li
              key={index}
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor:
                  selectedMember === member ? "#d9f5d2" : "transparent",
              }}
              onClick={() => setSelectedMember(member)}
            >
              {member}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>Chat with {selectedMember || "..."}</h2>
        <div
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "70vh",
            overflowY: "auto",
            marginBottom: "10px",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "5px" }}>
              {msg}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ width: "75%", padding: "10px" }}
        />
        <button
          onClick={sendMessage}
          disabled={!selectedMember || !message.trim()}
          style={{
            padding: "10px 20px",
            marginLeft: "10px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
