import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student", // نقش پیش‌فرض
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authAPI.register(formData);
      // بعد از ثبت‌نام موفق، کاربر را به صفحه ورود می‌بریم
      alert("ثبت‌نام با موفقیت انجام شد. حالا می‌توانید وارد شوید.");
      navigate("/login");
    } catch (err) {
      // نمایش پیام خطای مناسب (اگر نام کاربری تکراری بود یا ...)
      if (err.response && err.response.data) {
        const serverError = err.response.data;
        setError(serverError.username ? "این نام کاربری قبلاً انتخاب شده است." : "خطایی در ثبت‌نام رخ داد. دوباره تلاش کنید.");
      } else {
        setError("ارتباط با سرور برقرار نشد (خطای CORS یا شبکه).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ textAlign: "center", color: "#5b6cff", marginBottom: "20px" }}>عضویت در سامانه</h2>
        
        {error && <p style={{ color: "red", fontSize: "13px", textAlign: "center", background: "#ffe6e6", padding: "8px", borderRadius: "5px" }}>{error}</p>}
        
        <input name="username" type="text" placeholder="نام کاربری" style={inputStyle} onChange={handleChange} required />
        <input name="email" type="email" placeholder="ایمیل" style={inputStyle} onChange={handleChange} required />
        <input name="password" type="password" placeholder="رمز عبور" style={inputStyle} onChange={handleChange} required />
        
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>نقش خود را انتخاب کنید:</label>
          <select name="role" style={inputStyle} onChange={handleChange} value={formData.role}>
            <option value="student">شهروند (دانشجو)</option>
            <option value="teacher">مسئول شهری (مدرس)</option>
          </select>
        </div>

        <button type="submit" style={btnStyle} disabled={loading}>
          {loading ? "در حال ثبت..." : "ثبت‌نام"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" style={{ color: "#5b6cff", textDecoration: "none", fontWeight: "bold" }}>وارد شوید</Link>
        </p>
      </form>
    </div>
  );
};

// استایل‌ها (هماهنگ با صفحه Login)
const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2ff", direction: "rtl", padding: "20px" };
const formStyle = { background: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" };
const inputStyle = { width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "14px", fontFamily: "inherit" };
const btnStyle = { width: "100%", padding: "12px", background: "#5b6cff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", transition: "0.3s" };

export default Register;