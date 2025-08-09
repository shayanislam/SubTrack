// src/pages/Login.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav("/app");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Log in</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="submit">Log in</button>
      </form>
      <div style={{ marginTop: 8 }}>
        New here? <Link to="/signup">Create an account</Link>
      </div>
    </div>
  );
}
