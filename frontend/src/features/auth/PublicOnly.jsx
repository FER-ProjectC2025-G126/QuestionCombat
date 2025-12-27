import { useAuth } from './AuthProvider';
import { Navigate, Outlet } from 'react-router-dom';

const PublicOnly = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PublicOnly;
