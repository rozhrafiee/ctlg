import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/auth/ProfilePage'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const PlacementTestPage = lazy(() => import('./pages/student/PlacementTestPage'));
const TestListPage = lazy(() => import('./pages/student/TestListPage'));
const TestTaking = lazy(() => import('./pages/student/TestTaking'));
const TestResultPage = lazy(() => import('./pages/student/TestResultPage'));
const LearningPathPage = lazy(() => import('./pages/student/LearningPathPage'));
const ProgressPage = lazy(() => import('./pages/student/ProgressPage'));
const ContentDetailPage = lazy(() => import('./pages/student/ContentDetailPage'));
const History = lazy(() => import('./pages/student/History'));
const RecommendedPage = lazy(() => import('./pages/student/RecommendedPage'));
const AdaptiveDashboardPage = lazy(() => import('./pages/student/AdaptiveDashboardPage'));

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherContentList = lazy(() => import('./pages/teacher/TeacherContentList'));
const CreateContentPage = lazy(() => import('./pages/teacher/CreateContentPage'));
const EditContentPage = lazy(() => import('./pages/teacher/EditContentPage'));
const TeacherTestList = lazy(() => import('./pages/teacher/TeacherTestList'));
const CreateTestPage = lazy(() => import('./pages/teacher/CreateTestPage'));
const EditTestPage = lazy(() => import('./pages/teacher/EditTestPage'));
const TestQuestionsPage = lazy(() => import('./pages/teacher/TestQuestionsPage'));
const GradingPage = lazy(() => import('./pages/teacher/GradingPage'));

const ManagerDashboard = lazy(() => import('./pages/manager/ManagerDashboard'));
const AdminEngagementPage = lazy(() => import('./pages/admin/AdminEngagementPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center text-neutral-500 px-4">
      در حال بارگذاری...
    </div>
  );
}

function homeRedirect(user) {
  if (!user) return null;
  if (user.role === 'admin') return <Navigate to="/manager/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.has_taken_placement_test) return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/student/placement-test" replace />;
}

function ProtectedRoute({
  children,
  requirePlacementTest = false,
  teacherOnly = false,
  studentOnly = false,
  adminOnly = false,
}) {
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

  if (adminOnly && user.role !== 'admin') {
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  if (studentOnly && user.role !== 'student') {
    if (user.role === 'admin') return <Navigate to="/manager/dashboard" replace />;
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
    return homeRedirect(user);
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={user ? homeRedirect(user) : <HomePage />}
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
        <Route path="/student/recommended" element={
          <ProtectedRoute studentOnly requirePlacementTest>
            <AppShell title="پیشنهادهای هوشمند"><RecommendedPage /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/student/adaptive-dashboard" element={
          <ProtectedRoute studentOnly requirePlacementTest>
            <AppShell title="داشبورد تطبیقی"><AdaptiveDashboardPage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <AppShell title="پروفایل"><ProfilePage /></AppShell>
          </ProtectedRoute>
        } />

        <Route path="/manager/dashboard" element={
          <ProtectedRoute adminOnly>
            <AppShell title="نمای کلی سامانه"><ManagerDashboard /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/manager/engagement" element={
          <ProtectedRoute adminOnly>
            <AppShell title="شاخص ماندگاری"><AdminEngagementPage /></AppShell>
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

        <Route path="*" element={user ? homeRedirect(user) : <Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
