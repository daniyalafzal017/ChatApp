import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loginSuccess } from "../../Redux/authSlice";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Link,
} from "@mui/material";
import "./Login.css"; // Import the custom CSS file

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });
      dispatch(loginSuccess(res.data));
      console.log("Login successful", res.data);
      navigate("/chat");
    } catch (err) {
      console.error("Login failed", err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="login-bg">
      <Container maxWidth="xs" className="login-container">
        <Box component="form" onSubmit={handleSubmit} className="login-form">
          <Typography variant="h5" className="login-title">
            Login
          </Typography>

          <TextField
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            className="login-input"
          />

          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            className="login-input"
          />

          <Button
            type="submit"
            variant="contained"
            className="login-button"
            fullWidth
          >
            Login
          </Button>
          <div className="login-prompt">
            <p> Create New Account?</p>
            <Link href="/signup" className="create-account-link">
              Signup
            </Link>
          </div>
        </Box>
      </Container>
    </div>
  );
}
