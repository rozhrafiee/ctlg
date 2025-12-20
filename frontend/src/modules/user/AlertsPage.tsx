import { useEffect, useState } from "react";
import { api } from "../../utils/api";

interface Alert {
  id: number;
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
  is_read: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await api.get("/api/analytics/my-alerts/");
      setAlerts(res.data);
    } catch (err) {
      console.error("خطا در بارگذاری هشدارها:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
      await api.patch(`/api/analytics/alerts/${alertId}/`, { is_read: true });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
    } catch (err) {
      console.error("خطا در به‌روزرسانی هشدار:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter((a) => !a.is_read);
      await Promise.all(
        unreadAlerts.map((a) =>
          api.patch(`/api/analytics/alerts/${a.id}/`, { is_read: true })
        )
      );
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    } catch (err) {
      console.error("خطا در به‌روزرسانی هشدارها:", err);
    }
  };

  if (loading) return <div>در حال بارگذاری هشدارها...</div>;

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>هشدارها و اعلان‌ها</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary">
            علامت‌گذاری همه به عنوان خوانده شده
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="card">
          <p>هیچ هشداری وجود ندارد.</p>
        </div>
      ) : (
        <div>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`card ${!alert.is_read ? "alert-unread" : ""}`}
              style={{
                borderLeft: `4px solid ${
                  alert.severity === "critical"
                    ? "#dc3545"
                    : alert.severity === "warning"
                    ? "#ffc107"
                    : "#17a2b8"
                }`,
                marginBottom: "10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
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
                      <span style={{ color: "#007bff", fontSize: "12px" }}>جدید</span>
                    )}
                  </div>
                  <p style={{ margin: "10px 0" }}>{alert.message}</p>
                  <small style={{ color: "#666" }}>
                    {new Date(alert.created_at).toLocaleString("fa-IR")}
                  </small>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="btn-secondary"
                    style={{ marginLeft: "10px" }}
                  >
                    خوانده شد
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

