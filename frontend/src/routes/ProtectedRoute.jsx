import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB] dark:bg-[#070B12]">
        <div className="text-primary font-bold animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.map((r) => r.toLowerCase()).includes(user.role?.toLowerCase())
  ) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
