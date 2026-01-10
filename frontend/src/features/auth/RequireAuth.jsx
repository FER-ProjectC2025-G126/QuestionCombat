import { useAuth } from './AuthProvider';
import { Navigate, Outlet } from 'react-router';

const RequireAuth = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
