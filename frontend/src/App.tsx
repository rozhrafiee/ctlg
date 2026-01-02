import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import { api } from "./utils/api";

/* ========= Auth ========= */
import LoginPage from "./modules/auth/LoginPage";
import SignupPage from "./modules/auth/SignupPage";

/* ========= Student ========= */
import RecommendedContentPage from "./modules/learning/RecommendedContentPage";
import TestsListPage from "./modules/assessment/TestsListPage";
import TestSessionPage from "./modules/assessment/TestSessionPage";
import TestResultPage from "./modules/assessment/TestResultPage";
import PlacementTestPage from "./modules/assessment/PlacementTestPage";
import AlertsPage from "./modules/user/AlertsPage";

/* ========= Teacher ========= */
import TeacherDashboardPage from "./modules/teacher/TeacherDashboardPage";
import TeacherTestsPage from "./modules/teacher/TeacherTestsPage";
import AddQuestionPage from "./modules/teacher/AddQuestionPage";
import ContentManagementPage from "./modules/teacher/ContentManagementPage";

/* ========= Admin ========= */
import DashboardPage from "./modules/admin/DashboardPage";

/* =====================
   ROUTE GUARDS
===================== */

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.accessToken);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return <div style={{ padding: 40 }}>در حال بارگذاری...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function TeacherRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return <div style={{ padding: 40 }}>در حال بارگذاری...</div>;
  }

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return <div style={{ padding: 40 }}>در حال بارگذاری...</div>;
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

/* =====================
   PLACEMENT TEST GUARD
===================== */

function PlacementTestGuard({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (user && user.role === "student") {
        try {
          const res = await api.get("/api/accounts/needs-placement-test/");
          if (res.data.needs_placement_test) {
            window.location.href = "/placement-test";
            return;
          }
        } catch {
          // ignore
        }
      }
      setChecking(false);
    };

    check();
  }, [user]);

  if (checking) {
    return <div style={{ padding: 40 }}>در حال بررسی...</div>;
  }

  return children;
}

/* =====================
   APP
===================== */

export default function App() {
  const { user, logout } = useAuthStore();
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadAlerts();
      const interval = setInterval(loadUnreadAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadAlerts = async () => {
    try {
      const res = await api.get("/api/analytics/my-alerts/");
      const count = res.data.filter((a: any) => !a.is_read).length;
      setUnreadAlerts(count);
    } catch {
      // ignore
    }
  };

  return (
    <div className="app">
      {/* ========= NAVBAR ========= */}
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            سامانه یادگیری شناختی
          </Link>
        </div>

        <nav className="navbar-right">
          {user ? (
            <>
              <span>
                {user.username}
                {user.role === "student" && ` (سطح ${user.cognitive_level})`}
              </span>

              {user.role === "student" && <Link to="/tests">آزمون‌ها</Link>}
              <Link to="/learning">آموزش‌ها</Link>

              <Link to="/alerts">
                هشدارها
                {unreadAlerts > 0 && (
                  <span className="badge">{unreadAlerts}</span>
                )}
              </Link>

              {(user.role === "teacher" || user.role === "admin") && (
                <Link to="/teacher">پنل استاد</Link>
              )}

              {user.role === "admin" && (
                <Link to="/admin">داشبورد مدیر</Link>
              )}

              <button onClick={logout} className="btn-secondary">
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login">ورود</Link>
              <Link to="/signup">ثبت‌نام</Link>
            </>
          )}
        </nav>
      </header>

      {/* ========= ROUTES ========= */}
      <main className="main">
        <Routes>
          {/* Home */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <PlacementTestGuard>
                  <RecommendedContentPage />
                </PlacementTestGuard>
              </PrivateRoute>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Student */}
          <Route
            path="/placement-test"
            element={
              <PrivateRoute>
                <PlacementTestPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/tests"
            element={
              <PrivateRoute>
                <TestsListPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/tests/:id"
            element={
              <PrivateRoute>
                <TestSessionPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/tests/result/:sessionId"
            element={
              <PrivateRoute>
                <TestResultPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/learning"
            element={
              <PrivateRoute>
                <RecommendedContentPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <PrivateRoute>
                <AlertsPage />
              </PrivateRoute>
            }
          />

          {/* ========= Teacher ========= */}
          <Route
            path="/teacher"
            element={
              <PrivateRoute>
                <TeacherRoute>
                  <TeacherDashboardPage />
                </TeacherRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/teacher/tests"
            element={
              <PrivateRoute>
                <TeacherRoute>
                  <TeacherTestsPage />
                </TeacherRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/teacher/tests/:testId"
            element={
              <PrivateRoute>
                <TeacherRoute>
                  <AddQuestionPage />
                </TeacherRoute>
              </PrivateRoute>
            }
          />

          <Route
            path="/teacher/content"
            element={
              <PrivateRoute>
                <TeacherRoute>
                  <ContentManagementPage />
                </TeacherRoute>
              </PrivateRoute>
            }
          />

          {/* ========= Admin ========= */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <DashboardPage />
                </AdminRoute>
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
