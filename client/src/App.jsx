import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/Signup/Signup";
import Chat from "./Pages/Chat/Chat";

export default function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/chat"
        element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
