import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRoleFromToken } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');

  if (!token || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const role = getRoleFromToken();
    if (role !== requiredRole) {
      if (requiredRole === 'admin') {
        return <Navigate to="/login" replace />;
      }
      if (role === 'owner') return <Navigate to="/owner-dashboard" replace />;
      if (role === 'admin') return <Navigate to="/admin" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

