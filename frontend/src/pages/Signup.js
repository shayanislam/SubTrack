// src/pages/Signup.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await createUserWithEmailAndPassword(auth, email, pw);
      nav("/app");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Create account</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="submit">Sign up</button>
      </form>
      <div style={{ marginTop: 8 }}>
        Have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
