import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function Protected({ children, authentication = true }) {
  const authStatus = useSelector((state) => state.auth.status);
  const location = useLocation();

  if (authentication && !authStatus) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!authentication && authStatus) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export const AuthLayout = Protected;
