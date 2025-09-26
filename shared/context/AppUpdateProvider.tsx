import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useAppUpdate } from "@/shared/hooks/useAppUpdate";
import { AppUpdateDialog } from "@/shared/components/AppUpdateDialog";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

interface AppUpdateContextType {
  checkForUpdates: () => Promise<void>;
  isChecking: boolean;
}

const AppUpdateContext = createContext<AppUpdateContextType | undefined>(undefined);

export const useAppUpdateContext = () => {
  const context = useContext(AppUpdateContext);
  if (!context) {
    throw new Error("useAppUpdateContext must be used within an AppUpdateProvider");
  }
  return context;
};

interface AppUpdateProviderProps {
  children: React.ReactNode;
}

export const AppUpdateProvider: React.FC<AppUpdateProviderProps> = ({ children }) => {
  const { isSignedIn } = useAuth();
  const {
    versionInfo,
    isUpdateDialogVisible,
    isChecking,
    checkForUpdates,
    hideUpdateDialog,
    handleUpdateLater,
  } = useAppUpdate();

  // Check for updates when user signs in
  useEffect(() => {
    if (isSignedIn) {
      const checkUpdatesAfterSignIn = async () => {
        try {
          GlobalErrorHandler.logDebug(
            "User signed in - checking for app updates",
            "APP_UPDATE_PROVIDER"
          );

          // Add a small delay to let the login flow complete
          setTimeout(async () => {
            await checkForUpdates();
          }, 2000);
        } catch (error) {
          GlobalErrorHandler.logError(error, "Failed to check updates after sign in");
        }
      };

      checkUpdatesAfterSignIn();
    }
  }, [isSignedIn, checkForUpdates]);

  const contextValue: AppUpdateContextType = {
    checkForUpdates,
    isChecking,
  };

  return (
    <AppUpdateContext.Provider value={contextValue}>
      {children}

      {/* Global update dialog */}
      {versionInfo && (
        <AppUpdateDialog
          visible={isUpdateDialogVisible}
          onClose={hideUpdateDialog}
          versionInfo={versionInfo}
          onUpdateLater={handleUpdateLater}
        />
      )}
    </AppUpdateContext.Provider>
  );
};