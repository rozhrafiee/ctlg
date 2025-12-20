import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    try {
      await register(username, email, password, role);
      navigate("/");
    } catch (err) {
      setError("ثبت‌نام ناموفق بود. لطفاً اطلاعات را بررسی کنید.");
    }
  };

  return (
    <div className="auth-container">
      <h2>ساخت حساب کاربری</h2>
      <form onSubmit={handleSubmit} className="card">
        <label>
          نام کاربری
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          ایمیل (اختیاری)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          نوع حساب کاربری
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "student" | "teacher")}
            required
          >
            <option value="student">دانش‌آموز</option>
            <option value="teacher">استاد</option>
          </select>
        </label>
        <label>
          رمز عبور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          تکرار رمز عبور
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn-primary">
          ثبت‌نام
        </button>
        <div className="auth-footer">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود</Link>
        </div>
      </form>
    </div>
  );
}



