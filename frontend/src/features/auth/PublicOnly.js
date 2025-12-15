import React from "react";
import { useAuth } from "./AuthProvider";
import { Navigate, Outlet } from "react-router";

const PublicOnly = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PublicOnly;
