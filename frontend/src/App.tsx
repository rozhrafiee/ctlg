import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./modules/auth/LoginPage";
import SignupPage from "./modules/auth/SignupPage";
import TestsListPage from "./modules/assessment/TestsListPage";
import TestSessionPage from "./modules/assessment/TestSessionPage";
import RecommendedContentPage from "./modules/learning/RecommendedContentPage";
import DashboardPage from "./modules/admin/DashboardPage";

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

export default function App() {
  const { user, logout } = useAuthStore();

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
            path="/learning"
            element={
              <PrivateRoute>
                <RecommendedContentPage />
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


