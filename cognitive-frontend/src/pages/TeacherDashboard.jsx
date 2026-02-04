import { useEffect, useState } from "react";
// ✅ وارد کردن Link و useNavigate از react-router-dom
import { Link, useNavigate } from "react-router-dom";
import { analyticsAPI } from "../services/api";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const navigate = useNavigate(); // در حال حاضر نیازی به navigate نیست، اما اگر نیاز بود، باید import شود.

  useEffect(() => {
    analyticsAPI
      .teacherDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("خطا در دریافت اطلاعات داشبورد"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="dashboard-loading">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h2>داشبورد استاد</h2>
        <p>{data.teacher_name} خوش آمدید 👋</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-value">{data.stats.total_contents}</span>
          <span className="stat-label">محتواهای من</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{data.stats.total_tests}</span>
          <span className="stat-label">آزمون‌ها</span>
        </div>

        <div className="stat-card danger">
          <span className="stat-value">{data.stats.pending_grading}</span>
          <span className="stat-label">در انتظار تصحیح</span>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="dashboard-section">
        <h3>آزمون‌های در انتظار تصحیح</h3>

        {data.recent_pending_reviews.length === 0 ? (
          <p className="empty-text">موردی وجود ندارد</p>
        ) : (
          <ul className="pending-list">
            {data.recent_pending_reviews.map((s) => (
              <li key={s.id} className="pending-item">
                <span>شناسه جلسه: {s.id}</span>
                <span>
                  {new Date(s.started_at).toLocaleDateString("fa-IR")}
                </span>
                {/* ✅ لینک ناوبری به صفحه تصحیح جلسه خاص */}
                <Link 
                  to={`/teacher/reviews/${s.id}/grade`}
                  className="btn-link"
                >
                  تصحیح
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Links */}
      <div className="dashboard-section">
        <h3>دسترسی سریع</h3>
        <div className="quick-links">
          {/* ✅ استفاده از Link و مسیر استاندارد /new */}
          <Link to="/teacher/contents/new" className="btn">
            ایجاد محتوا
          </Link>
          <Link to="/teacher/tests/new" className="btn">
            ایجاد آزمون
          </Link>
          {/* ✅ لینک به لیست کامل بررسی‌ها */}
          <Link to="/teacher/reviews" className="btn secondary">
            آزمون‌های در انتظار تصحیح
          </Link>
        </div>
      </div>
    </div>
  );
}
