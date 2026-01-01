import { useNavigate } from "react-router-dom";

export default function TeacherDashboardPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <h2 style={{ marginBottom: 10 }}>🎓 پنل استاد</h2>
      <p style={{ color: "#555", marginBottom: 30 }}>
        مدیریت کامل آزمون‌ها، آزمون تعیین سطح و محتواهای آموزشی
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
          <p>ایجاد آزمون جدید، آزمون تعیین سطح و مدیریت سوالات هر آزمون</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/teacher/tests")}
            style={{ cursor: "pointer" }}
          >
            ورود به بخش آزمون‌ها
          </button>
        </div>

        <div className="card">
          <h3>📚 مدیریت محتواهای آموزشی</h3>
          <p>تعریف، ویرایش و حذف محتواهای آموزشی برای مسیر یادگیری تطبیقی</p>
          <button
            className="btn-primary"
            onClick={() => navigate("/teacher/content")}
            style={{ cursor: "pointer" }}
          >
            ورود به بخش محتواها
          </button>
        </div>
      </div>
    </div>
  );
}
