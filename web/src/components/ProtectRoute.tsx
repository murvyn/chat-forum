import { useAuth } from "@/contexts/AuthContext";
import useAuthMiddleware from "@/hooks/useAuthMiddleware";
import React from "react";
import { Navigate } from "react-router-dom";

type ProtectRouteProps = {
  children: React.ReactNode;
};
const ProtectRoute = ({ children }: ProtectRouteProps) => {
  const { user } = useAuth();

  useAuthMiddleware();
  if (!user) {
    return <Navigate to="/auth/sign-in" />;
  }
  return children;
};

export default ProtectRoute;
