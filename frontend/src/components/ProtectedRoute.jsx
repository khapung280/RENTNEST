import { Navigate } from 'react-router-dom';
import { isAuthenticated, getRoleFromToken } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = localStorage.getItem('token');

  if (!token || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRoleFromToken();
  const hasAccess = requiredRole ? role === requiredRole : true;

  console.log('[ProtectedRoute]', { role, requiredRole, hasAccess });

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

