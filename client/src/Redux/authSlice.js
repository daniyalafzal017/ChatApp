// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const parsedUser = storedUser ? JSON.parse(storedUser) : null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!parsedUser,
    user: parsedUser,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload)); // ⬅️ save on login
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("user"); // ⬅️ remove on logout
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
