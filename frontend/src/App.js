import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <BrowserRouter>
      <header style={{ padding: "1rem", display: "flex", justifyContent: "space-between" }}>
        <Link to="/" style={{ textDecoration: "none", fontWeight: 700 }}>SubTrack</Link>
        {user ? (
          <button onClick={() => signOut(auth)}>Sign out</button>
        ) : (
          <nav style={{ display: "flex", gap: 8 }}>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </nav>
        )}
      </header>

      <Routes>
        <Route path="/" element={<div style={{ padding: 24 }}><h2>Welcome to SubTrack</h2></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
