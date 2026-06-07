import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const token = localStorage.getItem('token');

  if (!token || !userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const normalizedUserRole = userRole.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.trim().toLowerCase());

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    if (normalizedUserRole === 'faculty') return <Navigate to="/faculty" replace />;
    if (normalizedUserRole === 'hod') return <Navigate to="/hod/dashboard" replace />;
    if (normalizedUserRole === 'coordinator') return <Navigate to="/dashboard" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;