import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Consultations.css";

const CONSULTED_KEY = "consultations_read";

function Card({ to, read, onClick, title, desc }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick()} className="consultation-card">
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className={`status ${read ? "read" : "active"}`}>{read ? "خوانده شد" : "ورود"}</span>
    </div>
  );
}

const Consultations = () => {
  const { isStudent, isTeacher, isAdmin, hasTakenPlacementTest } = useAuth();
  const navigate = useNavigate();
  const [readPaths, setReadPaths] = useState(() => {
    try {
      const raw = localStorage.getItem(CONSULTED_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(CONSULTED_KEY, JSON.stringify(readPaths));
  }, [readPaths]);

  const markRead = (path) => {
    setReadPaths((prev) => ({ ...prev, [path]: true }));
  };

  const handleCardClick = (path) => (e) => {
    markRead(path);
    navigate(path);
  };

  // اگر ادمین این صفحه رو دید، ببرش پنل خودش
  if (isAdmin) return <Navigate to="/admin" replace />;

  // اگر مسئول شهری (مدرس) این صفحه رو دید، ببرش پنل خودش
  if (isTeacher) return <Navigate to="/teacher/dashboard" replace />;

  // شهروند قبل تعیین سطح فقط باید بره تعیین سطح
  if (isStudent && !hasTakenPlacementTest) {
    return (
      <div className="consultations-page">
        <div className="consultations-header">
          <h1>پیشخوان</h1>
        </div>

        <div className="empty-state">
          برای دسترسی به بخش‌های سامانه، ابتدا باید آزمون تعیین سطح را انجام دهید.
        </div>

        <div style={{ marginTop: 16 }}>
          <Link to="/placement" className="btn btn-primary">
            شروع آزمون تعیین سطح
          </Link>
        </div>
      </div>
    );
  }

  // شهروند بعد تعیین سطح: لینک‌های کلیدی سامانه
  return (
    <div className="consultations-page">
      <div className="consultations-header">
        <h1>پیشخوان یادگیری</h1>
      </div>

      <div className="consultations-list">
        <Card to="/dashboard" read={readPaths["/dashboard"]} onClick={handleCardClick("/dashboard")} title="داشبورد شهروند" desc="سطح، رتبه و نمودارهای شناختی" />
        <Card to="/exams" read={readPaths["/exams"]} onClick={handleCardClick("/exams")} title="آزمون‌های مجاز" desc="لیست آزمون‌ها بر اساس سطح شما" />
        <Card to="/learning-path" read={readPaths["/learning-path"]} onClick={handleCardClick("/learning-path")} title="مسیر یادگیری" desc="محتواهای زنجیره‌ای و وضعیت قفل بودن" />
        <Card to="/my-stats" read={readPaths["/my-stats"]} onClick={handleCardClick("/my-stats")} title="آمار شناختی من" desc="تحلیل دقیق نمرات شناختی بر اساس دسته‌بندی سوالات" />
        <Card to="/profile" read={readPaths["/profile"]} onClick={handleCardClick("/profile")} title="پروفایل" desc="سطح، نقش، تاریخچه تغییر سطح" />
      </div>
    </div>
  );
};

export default Consultations;
