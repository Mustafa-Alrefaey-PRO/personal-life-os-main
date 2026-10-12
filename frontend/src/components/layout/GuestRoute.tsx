import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface GuestRouteProps { children: React.ReactNode }

/** For pages only signed-out users should see (login, register); signed-in users go to the dashboard. */
export const GuestRoute = ({ children }: GuestRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized   = useAuthStore((state) => state.isInitialized);

  if (isInitialized && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
