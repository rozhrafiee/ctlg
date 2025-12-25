import { useEffect, useState, FormEvent } from "react";
import { api } from "../../utils/api";

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
  user_username: string;
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  is_read: boolean;
}

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
    loadData();
    loadAlerts();
    loadUsers();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/api/analytics/overview/");
      setData(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری آمار:", err);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await api.get("/api/analytics/alerts/");
      setAlerts(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری هشدارها:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/api/accounts/users/");
      setUsers(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری کاربران:", err);
    }
  };

  const handleSendAlert = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/analytics/alerts/", alertForm);
      setShowAlertForm(false);
      setAlertForm({ user: "", message: "", severity: "info" });
      await loadAlerts();
    } catch (err: any) {
      setError(err.response?.data?.detail || "خطا در ارسال هشدار");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div>در حال بارگذاری داشبورد...</div>;

  return (
    <div>
      <h2>داشبورد مدیریتی</h2>
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

      <div className="card" style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3>مدیریت هشدارها</h3>
          <button
            className="btn-primary"
            onClick={() => setShowAlertForm(!showAlertForm)}
          >
            {showAlertForm ? "انصراف" : "ارسال هشدار جدید"}
          </button>
        </div>

        {showAlertForm && (
          <form onSubmit={handleSendAlert} className="card" style={{ marginBottom: "20px" }}>
            <h4>ارسال هشدار به کاربر</h4>
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
                    severity: e.target.value as "info" | "warning" | "critical",
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
                placeholder="متن هشدار را وارد کنید..."
              />
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "در حال ارسال..." : "ارسال هشدار"}
            </button>
          </form>
        )}

        <div>
          <h4>هشدارهای ارسال شده ({alerts.length})</h4>
          {alerts.length === 0 ? (
            <p>هیچ هشداری ارسال نشده است.</p>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="card"
                  style={{
                    marginBottom: "10px",
                    borderLeft: `4px solid ${
                      alert.severity === "critical"
                        ? "#dc3545"
                        : alert.severity === "warning"
                        ? "#ffc107"
                        : "#17a2b8"
                    }`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>{alert.user_username}</strong>
                      <span
                        style={{
                          marginLeft: "10px",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor:
                            alert.severity === "critical"
                              ? "#dc3545"
                              : alert.severity === "warning"
                              ? "#ffc107"
                              : "#17a2b8",
                          color: "white",
                        }}
                      >
                        {alert.severity === "critical"
                          ? "مهم"
                          : alert.severity === "warning"
                          ? "هشدار"
                          : "اطلاعیه"}
                      </span>
                      {!alert.is_read && (
                        <span style={{ color: "#007bff", fontSize: "12px", marginLeft: "10px" }}>
                          خوانده نشده
                        </span>
                      )}
                    </div>
                    <small style={{ color: "#666" }}>
                      {new Date(alert.created_at).toLocaleString("fa-IR")}
                    </small>
                  </div>
                  <p style={{ marginTop: "10px" }}>{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


