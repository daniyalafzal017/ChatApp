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
import SendIcon from "@mui/icons-material/Send";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import IconButton from "@mui/material/IconButton";
import PlacehoderImage from "../../assets/green.png";

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showUserList, setShowUserList] = useState(true);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      socket.emit("join", user.id); // Join private room
      console.log(`Joining socket room for user: ${user.id}`);
    }

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
        console.log("Received message:", msg);
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("update-users");
      socket.off("private-message");
    };
  }, [selectedMember, user?.id]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowUserList(false); // Desktop always shows both
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectMember = async (member) => {
    setSelectedMember(member);
    setMessages([]);
    setLoadingMessages(true);

    try {
      const res = await fetch(
        `http://localhost:3000/messages/history/${user.id}/${member.id}`
      );
      const data = await res.json();
      console.log("Fetched message history:", data);
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
      socket.emit("private-message", formatted);
      setMessage("");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    if (isMobile) setShowUserList(false); // show chat screen on mobile
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
            className="chat-search-bar"
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
        {/* Chat Box */}
        <Box className="chat-content">
          {!selectedMember ? (
            <Box className="chat-placeholder">
              <img
                src={PlacehoderImage}
                alt="Select a user"
                style={{ width: 150, marginBottom: 20 }}
              />
              <Typography variant="h5" color="textSecondary">
                Select a user to start chatting
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Start a conversation by clicking on a member from the left
                sidebar.
              </Typography>
            </Box>
          ) : (
            <>
              <Box className="chat-header">
                <Typography variant="h6" className="chat-header-title">
                  {selectedMember.username}
                </Typography>
                <IconButton
                  color="primary"
                  aria-label="start video call"
                  className="chat-meeting-btn"
                >
                  <VideoCallIcon />
                </IconButton>
              </Box>

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
                      {msg.time && (
                        <Typography variant="caption" className="message-time">
                          {new Date(msg.time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      )}
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
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!selectedMember || !message.trim()}
                  className="chat-send-button"
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
