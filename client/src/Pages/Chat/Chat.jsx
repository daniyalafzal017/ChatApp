import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/authSlice";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import "./Chat.css";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});
socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/auth/users")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));

    socket.on("update-users", (users) => {
      setMembers(users);
    });

    socket.on("private-message", (msg) => {
      if (
        (msg.senderId === user.id && msg.receiverId === selectedMember?.id) ||
        (msg.senderId === selectedMember?.id && msg.receiverId === user.id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("update-users");
      socket.off("private-message");
    };
  }, [selectedMember, user.id]);

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setMessages([]);
    setLoadingMessages(true);

    try {
      const res = await fetch(
        `http://localhost:3000/messages/history/${user.id}/${member.id}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
        console.warn("Unexpected data format:", data);
      }
    } catch (err) {
      console.error("Error fetching message history:", err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = () => {
    if (message.trim() && selectedMember) {
      const formatted = {
        senderId: user.id,
        receiverId: selectedMember.id,
        text: message,
        time: new Date().toISOString(),
      };
      console.log("Sending message:", formatted);
      setMessages((prev) => [...prev, formatted]);
      socket.emit("private-message", formatted);
      setMessage("");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const filteredMembers = members.filter((m) =>
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box className="chat-container">
      <AppBar position="static">
        <Toolbar className="navbar">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Welcome, {user?.username}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box className="chat-main">
        {/* Sidebar */}
        <Box className="chat-sidebar">
          <TextField
            sx={{ marginTop: "20px", width: "90%" }}
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <List className="chat-member-list">
            {filteredMembers.map((member) => (
              <ListItem
                className="chat-member-item"
                button
                key={member.id}
                selected={selectedMember?.id === member.id}
                onClick={() => handleSelectMember(member)}
                sx={{
                  borderRadius: 2,
                  backgroundColor:
                    selectedMember?.id === member.id
                      ? "#cce5cc"
                      : "transparent",
                }}
              >
                <ListItemText
                  primary={member.username}
                  secondary={member.email}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Box */}
        <Box className="chat-content">
          <Typography variant="h5" gutterBottom>
            Chat with {selectedMember?.username || "..."}
          </Typography>

          <Box className="chat-messages">
            {loadingMessages ? (
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <CircularProgress />
              </Box>
            ) : messages.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ textAlign: "center", marginTop: 2 }}
              >
                No messages yet.
              </Typography>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  className={`chat-message ${
                    msg.senderId === user.id ? "sent" : "received"
                  }`}
                >
                  {msg.text}
                </Box>
              ))
            )}
          </Box>

          <Box className="chat-input-box">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="chat-input"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!selectedMember || !message.trim()}
              className="chat-send-button"
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
