import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return <Navigate to="/login" replace />;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.accountType !== requiredRole) {
        // Redirect to appropriate dashboard based on user's actual role
        if (user.accountType === 'owner') {
          return <Navigate to="/owner-dashboard" replace />;
        } else if (user.accountType === 'admin') {
          return <Navigate to="/admin-dashboard" replace />;
        } else {
          return <Navigate to="/" replace />;
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

