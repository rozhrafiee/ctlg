import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const {
    isAuthenticated,
    isStudent,
    isTeacher,
    isAdmin,
    hasTakenPlacementTest,
  } = useAuth();

  // ریدایرکت هوشمند بعد از ورود
  if (isAuthenticated) {
    // مسیرهای مختلف برای مدیر، استاد و دانشجو
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isTeacher) return <Navigate to="/teacher/dashboard" replace />;
    if (isStudent && !hasTakenPlacementTest) return <Navigate to="/placement" replace />;
    if (isStudent && hasTakenPlacementTest) return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home">
      {/* هدر یا بخش اصلی */}
      <div className="hero">
        <h1>سامانه سنجش شناختی شهروندان</h1>
        <p>
          ارزیابی سطح شناختی، مسیر یادگیری هوشمند و آزمون‌های تطبیقی
        </p>

        {/* دکمه‌های ورود و ثبت‌نام */}
        <div className="hero-buttons">
          <Link to="/register" className="btn-small btn-small-primary">
            ثبت‌نام
          </Link>
          <Link to="/login" className="btn-small btn-small-primary">
            ورود
          </Link>
        </div>
      </div>

      {/* بخش ویژگی‌ها */}
      <div className="features">
        <div className="feature-card">
          <h3>آزمون تعیین سطح</h3>
          <p>ارزیابی اولیه توانمندی‌های شناختی و تعیین سطح ۱ تا ۱۰۰</p>
        </div>

        <div className="feature-card">
          <h3>مسیر یادگیری هوشمند</h3>
          <p>دسترسی به محتواها بر اساس سطح واقعی شما</p>
        </div>

        <div className="feature-card">
          <h3>آزمون‌های تطبیقی</h3>
          <p>ارتقای سطح بر اساس عملکرد واقعی در آزمون‌ها</p>
        </div>

        <div className="feature-card">
          <h3>تحلیل شناختی</h3>
          <p>گزارش پیشرفت، نمرات و تحلیل توانمندی‌ها</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
