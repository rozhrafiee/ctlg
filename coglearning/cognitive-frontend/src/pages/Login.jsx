import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
      navigate("/dashboard");
    } catch (err) {
      setError("نام کاربری یا رمز عبور اشتباه است یا خطای شبکه رخ داده.");
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ textAlign: "center", color: "#5b6cff" }}>ورود به سیستم</h2>
        {error && <p style={{ color: "red", fontSize: "13px", textAlign: "center" }}>{error}</p>}
        <input type="text" placeholder="نام کاربری" style={inputStyle} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="رمز عبور" style={inputStyle} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={btnStyle}>ورود</button>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          حساب ندارید؟ <Link to="/register" style={{ color: "#5b6cff" }}>ثبت‌نام کنید</Link>
        </p>
      </form>
    </div>
  );
};

// استایل‌ها
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2ff", direction: "rtl" };
const formStyle = { background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", width: "350px" };
const inputStyle = { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" };
const btnStyle = { width: "100%", padding: "10px", background: "#5b6cff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" };

export default Login;