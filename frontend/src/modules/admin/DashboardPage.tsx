import { useEffect, useState, FormEvent } from "react";
import { api } from "../../utils/api";

/* ===================== TYPES ===================== */

interface Overview {
  total_users: number;
  levels_distribution: Record<string, number>;
  total_test_sessions: number;
  average_test_score: number;
  completed_contents: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Alert {
  id: number;
  user_id: number;
  user_label: string; // ✅ FIXED
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  is_read: boolean;
}

/* ===================== COMPONENT ===================== */

export default function DashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({
    user: "",
    message: "",
    severity: "info" as "info" | "warning" | "critical",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
    loadAlerts();
    loadUsers();
  }, []);

  /* ===================== LOADERS ===================== */

  const loadOverview = async () => {
    const res = await api.get("/api/analytics/overview/");
    setData(res.data);
  };

  const loadAlerts = async () => {
    const res = await api.get("/api/analytics/alerts/");
    setAlerts(res.data);
  };

  const loadUsers = async () => {
    const res = await api.get("/api/accounts/users/");
    setUsers(res.data);
  };

  /* ===================== ALERT ===================== */

  const handleSendAlert = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/api/analytics/alerts/", alertForm);
      setAlertForm({ user: "", message: "", severity: "info" });
      setShowAlertForm(false);
      loadAlerts();
    } catch (err: any) {
      setError(err.response?.data?.detail || "خطا در ارسال هشدار");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== RENDER ===================== */

  if (!data) return <div>در حال بارگذاری داشبورد...</div>;

  return (
    <div>
      <h2>داشبورد مدیریتی</h2>

      {/* Overview */}
      <div className="grid">
        <div className="card">
          <h3>تعداد کل کاربران</h3>
          <p>{data.total_users}</p>
        </div>
        <div className="card">
          <h3>مجموع جلسات آزمون</h3>
          <p>{data.total_test_sessions}</p>
        </div>
        <div className="card">
          <h3>میانگین نمره آزمون‌ها</h3>
          <p>{data.average_test_score.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>محتوای تکمیل شده</h3>
          <p>{data.completed_contents}</p>
        </div>
      </div>

      {/* Levels */}
      <div className="card">
        <h3>توزیع سطح شناختی کاربران</h3>
        <ul>
          {Object.entries(data.levels_distribution).map(([level, count]) => (
            <li key={level}>
              سطح {level}: {count} نفر
            </li>
          ))}
        </ul>
      </div>

      {/* Alerts */}
      <div className="card" style={{ marginTop: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>مدیریت هشدارها</h3>
          <button className="btn-primary" onClick={() => setShowAlertForm(!showAlertForm)}>
            {showAlertForm ? "انصراف" : "ارسال هشدار"}
          </button>
        </div>

        {showAlertForm && (
          <form onSubmit={handleSendAlert} className="card">
            {error && <div className="error">{error}</div>}

            <label>
              کاربر
              <select
                value={alertForm.user}
                onChange={(e) => setAlertForm({ ...alertForm, user: e.target.value })}
                required
              >
                <option value="">انتخاب کاربر</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </label>

            <label>
              سطح اهمیت
              <select
                value={alertForm.severity}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    severity: e.target.value as Alert["severity"],
                  })
                }
              >
                <option value="info">اطلاعیه</option>
                <option value="warning">هشدار</option>
                <option value="critical">مهم</option>
              </select>
            </label>

            <label>
              پیام
              <textarea
                value={alertForm.message}
                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                rows={4}
                required
              />
            </label>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "در حال ارسال..." : "ارسال"}
            </button>
          </form>
        )}

        <h4>هشدارها ({alerts.length})</h4>
        {alerts.map((alert) => (
          <div key={alert.id} className="card">
            <strong>{alert.user_label}</strong>
            <p>{alert.message}</p>
            <small>{new Date(alert.created_at).toLocaleString("fa-IR")}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
