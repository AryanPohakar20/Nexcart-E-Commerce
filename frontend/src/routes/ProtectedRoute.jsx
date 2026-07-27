import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FB] dark:bg-[#070B12]">
        <div className="flex flex-col gap-4 w-full max-w-sm px-6">
          <div className="h-12 w-12 rounded-full skeleton mx-auto" />
          <div className="h-6 w-3/4 skeleton mx-auto" />
          <div className="h-4 w-1/2 skeleton mx-auto" />
          <div className="h-24 w-full skeleton mt-4" />
        </div>
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
