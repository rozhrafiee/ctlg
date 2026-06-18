import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessmentAPI } from "../services/api";

const MyHistory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await assessmentAPI.getMyHistory();
        setItems(res.data || []);
      } catch (err) {
        console.error("خطا در دریافت تاریخچه:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={styles.center}>در حال بارگذاری...</div>;

  return (
    <div style={styles.container}>
      <h2>تاریخچه آزمون‌های من</h2>
      {items.length === 0 ? (
        <div style={styles.empty}>تاریخچه‌ای وجود ندارد.</div>
      ) : (
        <div style={styles.list}>
          {items.map((s) => (
            <div key={s.id} style={styles.card}>
              <div>
                <strong>{s.test_title}</strong>
                <div style={styles.meta}>وضعیت: {s.status}</div>
              </div>
              <button onClick={() => navigate(`/test-results/${s.id}`)} style={styles.btn}>
                مشاهده جزئیات
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { direction: "rtl", padding: "30px", maxWidth: "800px", margin: "0 auto", fontFamily: "Tahoma" },
  list: { display: "grid", gap: "10px", marginTop: "20px" },
  card: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "#fff", borderRadius: "10px", border: "1px solid #eee" },
  meta: { fontSize: "0.85rem", color: "#7f8c8d", marginTop: "5px" },
  btn: { background: "#3498db", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" },
  empty: { textAlign: "center", padding: "40px", color: "#95a5a6" },
  center: { textAlign: "center", marginTop: "100px" },
};

export default MyHistory;
