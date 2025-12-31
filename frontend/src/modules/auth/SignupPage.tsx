import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../utils/api";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);

      // register (and login)
      await register(username, email, password, role);

      // 🔑 check placement test (only for students)
      if (role === "student") {
        const res = await api.get("/api/accounts/needs-placement-test/");
        if (res.data.needs_placement_test) {
          navigate("/placement-test");
          return;
        }
      }

      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        "ثبت‌نام ناموفق بود. لطفاً اطلاعات را بررسی کنید."
      );
    } finally {
      setLoading(false);
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

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>

        <div className="auth-footer">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">ورود</Link>
        </div>
      </form>
    </div>
  );
}
