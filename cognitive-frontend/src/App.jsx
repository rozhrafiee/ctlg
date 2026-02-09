import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';

import StudentDashboard from './pages/student/StudentDashboard';
import PlacementTestPage from './pages/student/PlacementTestPage';
import TestListPage from './pages/student/TestListPage';
import TestTaking from './pages/student/TestTaking';
import TestResultPage from './pages/student/TestResultPage';
import LearningPathPage from './pages/student/LearningPathPage';
import ProgressPage from './pages/student/ProgressPage';
import ContentDetailPage from './pages/student/ContentDetailPage';
import History from './pages/student/History';
import RecommendationsPage from './pages/student/RecommendationsPage';
import RecommendedPage from './pages/student/RecommendedPage';
import AdaptiveDashboardPage from './pages/student/AdaptiveDashboardPage';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherContentList from './pages/teacher/TeacherContentList';
import CreateContentPage from './pages/teacher/CreateContentPage';
import EditContentPage from './pages/teacher/EditContentPage';
import TeacherTestList from './pages/teacher/TeacherTestList';
import CreateTestPage from './pages/teacher/CreateTestPage';
import EditTestPage from './pages/teacher/EditTestPage';
import TestQuestionsPage from './pages/teacher/TestQuestionsPage';
import GradingPage from './pages/teacher/GradingPage';

function ProtectedRoute({ children, requirePlacementTest = false, teacherOnly = false, studentOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 px-4">
        در حال بارگذاری...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (studentOnly && user.role !== 'student') {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  if (teacherOnly && user.role !== 'teacher' && user.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (requirePlacementTest && user.role === 'student' && !user.has_taken_placement_test) {
    return <Navigate to="/student/placement-test" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 px-4">
        در حال بارگذاری...
      </div>
    );
  }

  if (user) {
    if (user.role === 'teacher' || user.role === 'admin') {
      return <Navigate to="/teacher/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user
            ? (user.role === 'teacher' || user.role === 'admin'
                ? <Navigate to="/teacher/dashboard" replace />
                : (user.has_taken_placement_test
                    ? <Navigate to="/student/dashboard" replace />
                    : <Navigate to="/student/placement-test" replace />))
            : <HomePage />
        }
      />

      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/student/dashboard" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="داشبورد شهروند"><StudentDashboard /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/placement-test" element={
        <ProtectedRoute studentOnly>
          <AppShell title="آزمون تعیین سطح"><PlacementTestPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/tests" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="لیست آزمون‌ها"><TestListPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/tests/:testId/take" element={
        <ProtectedRoute studentOnly>
          <AppShell title="شرکت در آزمون"><TestTaking /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/tests/:sessionId/result" element={
        <ProtectedRoute studentOnly>
          <AppShell title="نتیجه آزمون"><TestResultPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/learning-path" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="مسیر یادگیری"><LearningPathPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/progress" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="پیشرفت من"><ProgressPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/content/:id" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="جزئیات محتوا"><ContentDetailPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/history" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="تاریخچه آزمون‌ها"><History /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/recommendations" element={
        <ProtectedRoute studentOnly requirePlacementTest>
          <AppShell title="پیشنهادها"><RecommendationsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/recommended" element={
        <ProtectedRoute requirePlacementTest>
          <AppShell title="پیشنهادهای هوشمند"><RecommendedPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/student/adaptive-dashboard" element={
        <ProtectedRoute requirePlacementTest>
          <AppShell title="داشبورد تطبیقی"><AdaptiveDashboardPage /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppShell title="پروفایل"><ProfilePage /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="/teacher/dashboard" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="داشبورد مسئول شهری (مدرس)"><TeacherDashboard /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/contents" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="محتواهای من"><TeacherContentList /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/contents/create" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="ساخت محتوای جدید"><CreateContentPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/contents/:id/edit" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="ویرایش محتوا"><EditContentPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/tests" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="آزمون‌های من"><TeacherTestList /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/tests/create" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="ساخت آزمون جدید"><CreateTestPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/tests/:id/edit" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="ویرایش آزمون"><EditTestPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/tests/:id/questions" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="سوالات آزمون"><TestQuestionsPage /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/teacher/grading" element={
        <ProtectedRoute teacherOnly>
          <AppShell title="تصحیح و بررسی"><GradingPage /></AppShell>
        </ProtectedRoute>
      } />

      <Route path="*" element={
        user ? (
          user.role === 'teacher' || user.role === 'admin'
            ? <Navigate to="/teacher/dashboard" replace />
            : (user.has_taken_placement_test
                ? <Navigate to="/student/dashboard" replace />
                : <Navigate to="/student/placement-test" replace />)
        ) : (
          <Navigate to="/" replace />
        )
      } />
    </Routes>
  );
}
