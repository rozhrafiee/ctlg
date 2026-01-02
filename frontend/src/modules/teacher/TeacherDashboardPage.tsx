// src/modules/teacher/TeacherDashboardPage.tsx
import { Link } from "react-router-dom";

export default function TeacherDashboardPage() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2>🎓 پنل استاد</h2>
      <p style={{ color: "#555", marginBottom: 30 }}>
        مدیریت آزمون‌ها، آزمون تعیین سطح و محتواهای آموزشی
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <div className="card">
          <h3>📝 مدیریت آزمون‌ها</h3>
          <p>ایجاد آزمون، آزمون تعیین سطح و مدیریت سوالات</p>
          <Link to="/teacher/tests" className="btn-primary">
            ورود
          </Link>
        </div>

        <div className="card">
          <h3>📚 مدیریت محتوا</h3>
          <p>تعریف، ویرایش و حذف محتواهای آموزشی</p>
          <Link to="/teacher/content" className="btn-primary">
            ورود
          </Link>
        </div>
      </div>
    </div>
  );
}
