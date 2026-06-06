import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedFacultyRoute = ({ children }) => {
  const loggedInFaculty = localStorage.getItem('loggedInFaculty');
  
  if (!loggedInFaculty) {
    return <Navigate to="/faculty/login" replace />;
  }

  return children;
};

export default ProtectedFacultyRoute; 