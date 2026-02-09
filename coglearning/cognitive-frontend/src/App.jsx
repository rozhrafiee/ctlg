import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// --- وارد کردن کامپوننت‌ها ---
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard"; 
import PlacementTest from "./pages/PlacementTest";
import Profile from "./pages/Profile";
import TeacherTests from "./pages/TeacherTests";
import AvailableTests from "./pages/AvailableTests"; 
import TakeTest from "./pages/TakeTest"; 
import TestResults from "./pages/TestResults";
import Exams from "./pages/Exams";
import TestForm from "./pages/TestForm"; 
import TeacherReviews from "./pages/TeacherReviews"; 
import ContentDetail from "./pages/ContentDetail";
import MyHistory from "./pages/MyHistory";

// کامپوننت محافظت از مسیرها
const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const location = useLocation();
  if (!auth || auth.loading) return null;
  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  const auth = useAuth();

  if (!auth || auth.loading) {
    return <div style={{textAlign:'center', marginTop:'50px', fontFamily:'Tahoma'}}>در حال بارگذاری...</div>;
  }

  const { user } = auth;

  return (
    <>
      {/* ناوبار حالا در تمام صفحات سایت نمایش داده می‌شود */}
      <Navbar />

      <Routes>
        {/* مسیر اصلی: صفحه خانه (بدون نیاز به لاگین) */}
        <Route path="/" element={<Home />} />

        {/* مسیرهای عمومی (ورود و ثبت‌نام) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* داشبورد هوشمند (تشخیص استاد یا دانشجو) */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {user?.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
          </ProtectedRoute>
        } />

        {/* مسیرهای اختصاصی دانشجو */}
        <Route path="/available-tests" element={<ProtectedRoute><AvailableTests /></ProtectedRoute>} />
        <Route path="/placement-test" element={<ProtectedRoute><PlacementTest /></ProtectedRoute>} />
        <Route path="/take-test/:testId" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
        <Route path="/test-results/:sessionId" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
        <Route path="/content/:id" element={<ProtectedRoute><ContentDetail /></ProtectedRoute>} />
        <Route path="/my-history" element={<ProtectedRoute><MyHistory /></ProtectedRoute>} />

        {/* مسیرهای اختصاصی استاد */}
        <Route path="/teacher/tests" element={<ProtectedRoute><TeacherTests /></ProtectedRoute>} />
        <Route path="/add-test" element={<ProtectedRoute><TestForm /></ProtectedRoute>} />
        <Route path="/edit-test/:id" element={<ProtectedRoute><TestForm /></ProtectedRoute>} />
        <Route path="/teacher/reviews" element={<ProtectedRoute><TeacherReviews /></ProtectedRoute>} />

        {/* پروفایل کاربری */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* مدیریت خطای ۴۰۴ */}
        <Route path="*" element={<div style={{textAlign:'center', marginTop:'100px', fontFamily:'Tahoma'}}><h2>۴۰۴</h2><p>صفحه مورد نظر یافت نشد</p></div>} />
      </Routes>
    </>
  );
}

export default App;
