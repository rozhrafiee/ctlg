import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// ═════════════════════════════════════════════════════
// 🔒 مسیر محافظت‌شده عمومی
// ═════════════════════════════════════════════════════
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ═════════════════════════════════════════════════════
// 👨‍🏫 مسیر مخصوص استاد
// ═════════════════════════════════════════════════════
export const TeacherRoute = ({ children }) => {
  const { isAuthenticated, isTeacher, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isTeacher) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

// ═════════════════════════════════════════════════════
// 🎓 مسیر مخصوص دانش‌آموز
// ═════════════════════════════════════════════════════
export const StudentRoute = ({ children }) => {
  const { isAuthenticated, isStudent, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStudent) {
    return <Navigate to="/teacher/dashboard" replace />;
  }

  return children;
};

// ═════════════════════════════════════════════════════
// 📝 مسیر با آزمون جایابی
// ═════════════════════════════════════════════════════
export const PlacementTestRoute = ({ children }) => {
  const { hasPlacementTest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPlacementTest) {
    return <Navigate to="/placement-test" replace />;
  }

  return children;
};
