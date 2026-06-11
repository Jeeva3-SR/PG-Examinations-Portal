import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (loading) return null;

  if (!token || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedUserRole = role.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.trim().toLowerCase());

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    if (normalizedUserRole === 'faculty') return <Navigate to="/faculty" replace />;
    if (normalizedUserRole === 'hod') return <Navigate to="/hod/dashboard" replace />;
    if (normalizedUserRole === 'coordinator') return <Navigate to="/dashboard" replace />;

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;