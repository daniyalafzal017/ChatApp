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

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/auth/users")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched users:", data);
        setMembers(data);
      })
      .catch((err) => console.error("Error fetching users:", err));

    socket.on("update-users", (users) => {
      console.log("Received updated users:", users);
      setMembers(users);
    });

    socket.on("message", (msg) => {
      console.log("Received new message:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("update-users");
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && selectedMember) {
      const formatted = `You to ${selectedMember.username}: ${message}`;
      console.log("Sending message:", formatted);
      setMessages((prev) => [...prev, formatted]);
      socket.emit(
        "message",
        `${user.username} to ${selectedMember.username}: ${message}`
      );
      setMessage("");
    } else {
      console.log("Message or selected member is empty");
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
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
        <Box className="chat-sidebar">
          <TextField
            label="Search by email"
            variant="outlined"
            size="small"
            fullWidth
            className="chat-search"
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

          <List>
            {filteredMembers.map((member) => (
              <ListItem
                button
                key={member.id}
                selected={selectedMember?.id === member.id}
                onClick={() => setSelectedMember(member)}
              >
                <ListItemText
                  primary={member.username}
                  secondary={member.email}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box className="chat-content">
          <Typography variant="h5" gutterBottom>
            Chat with {selectedMember?.username || "..."}
          </Typography>
          <Box className="chat-messages">
            {messages.map((msg, index) => (
              <Box key={index} className="chat-message">
                {msg}
              </Box>
            ))}
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
