import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { PageLoader } from '../ui/Spinner';

interface ProtectedRouteProps { children: React.ReactNode }

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized   = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <div className="flex min-h-screen items-center justify-center bg-page"><PageLoader /></div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};
