import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Consultations.css";

const Consultations = () => {
  const { isStudent, isTeacher, isAdmin, hasTakenPlacementTest } = useAuth();

  // اگر ادمین این صفحه رو دید، ببرش پنل خودش
  if (isAdmin) return <Navigate to="/admin" replace />;

  // اگر استاد این صفحه رو دید، ببرش پنل استاد
  if (isTeacher) return <Navigate to="/teacher/dashboard" replace />;

  // دانش‌آموز قبل تعیین سطح فقط باید بره تعیین سطح
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

  // دانش‌آموز بعد تعیین سطح: لینک‌های کلیدی سامانه
  return (
    <div className="consultations-page">
      <div className="consultations-header">
        <h1>پیشخوان یادگیری</h1>
      </div>

      <div className="consultations-list">
        <Link to="/dashboard" className="consultation-card">
          <h3>داشبورد شهروند</h3>
          <p>سطح، رتبه، نمودارهای شناختی و پیشنهادها</p>
          <span className="status active">ورود</span>
        </Link>

        <Link to="/tests" className="consultation-card">
          <h3>آزمون‌های مجاز</h3>
          <p>لیست آزمون‌ها بر اساس سطح شما</p>
          <span className="status active">ورود</span>
        </Link>

        <Link to="/learning-path" className="consultation-card">
          <h3>مسیر یادگیری</h3>
          <p>محتواهای زنجیره‌ای و وضعیت قفل بودن</p>
          <span className="status active">ورود</span>
        </Link>

        <Link to="/recommended" className="consultation-card">
          <h3>پیشنهادات هوشمند</h3>
          <p>محتواهای مناسب سطح شما (تقریباً ±۵)</p>
          <span className="status active">ورود</span>
        </Link>

        <Link to="/my-stats" className="consultation-card">
          <h3>آمار شناختی من</h3>
          <p>تحلیل دقیق نمرات شناختی بر اساس دسته‌بندی سوالات</p>
          <span className="status active">ورود</span>
        </Link>

        <Link to="/profile" className="consultation-card">
          <h3>پروفایل</h3>
          <p>سطح، نقش، تاریخچه تغییر سطح</p>
          <span className="status active">ورود</span>
        </Link>
      </div>
    </div>
  );
};

export default Consultations;
