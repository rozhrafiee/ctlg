import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children, roles, requirePlacement = true }) {
  const { isAuthenticated, loading, user, hasTakenPlacementTest } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{textAlign: "center", marginTop: "50px"}}>در حال بارگذاری...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const role = user?.role;

  // بررسی سطح دسترسی نقش
  if (roles && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // منطق تعیین سطح برای دانشجو
  if (role === "student" && requirePlacement && !hasTakenPlacementTest) {
    if (location.pathname !== "/placement") {
      return <Navigate to="/placement" replace />;
    }
  }

  return children;
}
