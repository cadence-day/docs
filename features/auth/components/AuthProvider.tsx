import React, { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import AuthModalRouter from "./AuthModalRouter";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

// Simplified AuthProvider that handles both initialization and modal rendering
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();

  // During initial loading, show nothing (loading will be handled by layout)
  if (isLoading) {
    return null;
  }

  return (
    <ErrorBoundary>
      {children}
      {/* Only render auth modal when user is not authenticated */}
      {!user && <AuthModalRouter />}
    </ErrorBoundary>
  );
};

// Export the hook for components to use
export { useAuth } from "../hooks/useAuth";
