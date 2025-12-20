import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./modules/auth/LoginPage";
import SignupPage from "./modules/auth/SignupPage";
import TestsListPage from "./modules/assessment/TestsListPage";
import TestSessionPage from "./modules/assessment/TestSessionPage";
import RecommendedContentPage from "./modules/learning/RecommendedContentPage";
import DashboardPage from "./modules/admin/DashboardPage";
import TeacherDashboardPage from "./modules/teacher/TeacherDashboardPage";
import AddQuestionPage from "./modules/teacher/AddQuestionPage";
import AlertsPage from "./modules/user/AlertsPage";
import TestResultPage from "./modules/assessment/TestResultPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthStore();
  if (!user || user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function TeacherRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuthStore();
  if (!user || (user.role !== "teacher" && user.role !== "admin"))
    return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuthStore();
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadUnreadAlertsCount();
      const interval = setInterval(loadUnreadAlertsCount, 30000); // هر 30 ثانیه
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadAlertsCount = async () => {
    try {
      const { api } = await import("./utils/api");
      const res = await api.get("/api/analytics/my-alerts/");
      const unread = res.data.filter((a: any) => !a.is_read).length;
      setUnreadAlertsCount(unread);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            سامانه یادگیری شناختی
          </Link>
        </div>
        <nav className="navbar-right">
          {user && (
            <>
              <span className="nav-user">
                {user.username} (سطح: {user.cognitive_level})
              </span>
              <Link to="/tests">آزمون‌ها</Link>
              <Link to="/learning">آموزش‌ها</Link>
              <Link to="/alerts">
                هشدارها
                {unreadAlertsCount > 0 && (
                  <span
                    style={{
                      marginLeft: "5px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "12px",
                    }}
                  >
                    {unreadAlertsCount}
                  </span>
                )}
              </Link>
              {(user.role === "teacher" || user.role === "admin") && (
                <Link to="/teacher">پنل استاد</Link>
              )}
              {user.role === "admin" && <Link to="/admin">داشبورد</Link>}
              <button onClick={logout} className="btn-secondary">
                خروج
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login">ورود</Link>
              <Link to="/signup">ثبت‌نام</Link>
            </>
          )}
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RecommendedContentPage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
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
            path="/teacher/tests/:id"
            element={
              <PrivateRoute>
                <TeacherRoute>
                  <AddQuestionPage />
                </TeacherRoute>
              </PrivateRoute>
            }
          />
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
        </Routes>
      </main>
    </div>
  );
}


