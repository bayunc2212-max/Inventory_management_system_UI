import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { PageLoader } from '../components/ui/Spinner';

export function RequireAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const location = useLocation();
  if (!accessToken) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function RequireGuest() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (accessToken) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function RequirePermission({ permission }) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  if (!hasPermission(permission)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}

export function InitFetch() {
  const { user, accessToken, fetchMe, logout } = useAuthStore();

  useEffect(() => {
    if (accessToken && !user) {
      fetchMe().catch(() => {
        logout();
      });
    }
    if (accessToken) {
      useSettingsStore.getState().load().catch(() => {});
    }
  }, [accessToken, user, fetchMe, logout]);

  if (accessToken && !user) {
    return <PageLoader text="Memuat data pengguna..." />;
  }
  return <Outlet />;
}
