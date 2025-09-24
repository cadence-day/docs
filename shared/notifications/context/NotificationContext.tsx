import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { notificationEngine } from "../NotificationEngine";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

interface NotificationContextType {
  // Keep minimal interface for backwards compatibility
  engine: typeof notificationEngine;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  useEffect(() => {
    const initializeNotificationEngine = async () => {
      try {
        await notificationEngine.initialize();
        GlobalErrorHandler.logDebug(
          "NotificationProvider: Engine initialized successfully",
          "NotificationProvider.initialize"
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "NotificationProvider.initialize",
          {}
        );
      }
    };

    initializeNotificationEngine();

    // Cleanup on unmount
    return () => {
      try {
        notificationEngine.destroy();
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "NotificationProvider.cleanup",
          {}
        );
      }
    };
  }, []);

  const value: NotificationContextType = {
    engine: notificationEngine,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// Export for backwards compatibility
export { NotificationProvider as default };