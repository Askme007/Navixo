// src/components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { authService } from "../services/auth.service";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}