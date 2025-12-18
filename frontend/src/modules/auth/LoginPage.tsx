import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError("ورود ناموفق بود. نام کاربری یا رمز عبور را بررسی کنید.");
    }
  };

  return (
    <div className="auth-container">
      <h2>ورود به سامانه</h2>
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
          رمز عبور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn-primary">
          ورود
        </button>
        <div className="auth-footer">
          حساب کاربری ندارید؟ <Link to="/signup">ثبت‌نام کنید</Link>
        </div>
      </form>
    </div>
  );
}


