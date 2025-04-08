import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Link,
} from "@mui/material";
import "./Signup.css"; // Import the custom CSS file
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/signup", {
        username,
        email,
        password,
      });
      socket.emit("new-user", { username, email });
      console.log("User signed up successfully");
      setUsername("");
      setEmail("");
      setPassword("");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed", err);
    }
  };

  return (
    <div className="signup-bg">
      <Container maxWidth="xs" className="signup-container">
        <Box component="form" onSubmit={handleSubmit} className="signup-form">
          <Typography variant="h5" className="signup-title">
            Signup
          </Typography>

          <TextField
            label="Username"
            variant="outlined"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            className="signup-input"
          />

          <TextField
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            className="signup-input"
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            className="signup-input"
          />

          <Button
            type="submit"
            variant="contained"
            className="signup-button"
            fullWidth
          >
            Signup
          </Button>
          <div className="login-prompt">
            <p> Already have an account?</p>
            <Link href="/login" className="login-link">
              Login
            </Link>
          </div>
        </Box>
      </Container>
    </div>
  );
}
