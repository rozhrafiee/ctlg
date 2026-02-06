import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import Navbar from './components/layout/Navbar';

// General Pages
import HomePage from './pages/HomePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import PlacementTestPage from './pages/student/PlacementTestPage';
import TestListPage from './pages/student/TestListPage';
import TakeTestPage from './pages/student/TakeTestPage';
import TestResultPage from './pages/student/TestResultPage';
import LearningPathPage from './pages/student/LearningPathPage';
import ProgressPage from './pages/student/ProgressPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherContentList from './pages/teacher/TeacherContentList';
import CreateContentPage from './pages/teacher/CreateContentPage';
import EditContentPage from './pages/teacher/EditContentPage';
import TeacherTestList from './pages/teacher/TeacherTestList';
import CreateTestPage from './pages/teacher/CreateTestPage';
import EditTestPage from './pages/teacher/EditTestPage';
import TestQuestionsPage from './pages/teacher/TestQuestionsPage';
import GradingPage from './pages/teacher/GradingPage';

// Protected Route Component
function ProtectedRoute({ children, requirePlacementTest = false, teacherOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (teacherOnly && user.role !== 'teacher' && user.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (requirePlacementTest && user.role === 'student' && !user.has_taken_placement_test) {
    return <Navigate to="/student/placement-test" replace />;
  }

  return children;
}

// Public Route
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">در حال بارگذاری...</div>
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

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {user && <Navbar />}
      
      <Routes>
        <Route path="/" element={user ? <Navigate to="/student/dashboard" replace /> : <HomePage />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/student/dashboard" element={
          <ProtectedRoute requirePlacementTest><StudentDashboard /></ProtectedRoute>
        } />
        
        <Route path="/student/placement-test" element={
          <ProtectedRoute><PlacementTestPage /></ProtectedRoute>
        } />

        <Route path="/student/tests" element={
          <ProtectedRoute requirePlacementTest><TestListPage /></ProtectedRoute>
        } />

        <Route path="/student/tests/:testId/take" element={
          <ProtectedRoute requirePlacementTest><TakeTestPage /></ProtectedRoute>
        } />

        <Route path="/student/tests/:sessionId/result" element={
          <ProtectedRoute requirePlacementTest><TestResultPage /></ProtectedRoute>
        } />

        <Route path="/student/learning-path" element={
          <ProtectedRoute requirePlacementTest><LearningPathPage /></ProtectedRoute>
        } />

        <Route path="/student/progress" element={
          <ProtectedRoute requirePlacementTest><ProgressPage /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        <Route path="/teacher/dashboard" element={
          <ProtectedRoute teacherOnly><TeacherDashboard /></ProtectedRoute>
        } />

        <Route path="/teacher/contents" element={
          <ProtectedRoute teacherOnly><TeacherContentList /></ProtectedRoute>
        } />

        <Route path="/teacher/contents/create" element={
          <ProtectedRoute teacherOnly><CreateContentPage /></ProtectedRoute>
        } />

        <Route path="/teacher/contents/:id/edit" element={
          <ProtectedRoute teacherOnly><EditContentPage /></ProtectedRoute>
        } />

        <Route path="/teacher/tests" element={
          <ProtectedRoute teacherOnly><TeacherTestList /></ProtectedRoute>
        } />

        <Route path="/teacher/tests/create" element={
          <ProtectedRoute teacherOnly><CreateTestPage /></ProtectedRoute>
        } />

        <Route path="/teacher/tests/:id/edit" element={
          <ProtectedRoute teacherOnly><EditTestPage /></ProtectedRoute>
        } />

        <Route path="/teacher/tests/:id/questions" element={
          <ProtectedRoute teacherOnly><TestQuestionsPage /></ProtectedRoute>
        } />

        <Route path="/teacher/grading" element={
          <ProtectedRoute teacherOnly><GradingPage /></ProtectedRoute>
        } />

        <Route path="*" element={
          user ? (
            user.role === 'teacher' || user.role === 'admin' ? 
              <Navigate to="/teacher/dashboard" replace /> : 
              <Navigate to="/student/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
