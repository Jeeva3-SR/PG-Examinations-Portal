import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedHODRoute = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  
  if (userRole !== 'HOD') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedHODRoute; 