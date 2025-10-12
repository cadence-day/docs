import { useAppUpdate } from "@/shared/hooks/useAppUpdate";
import useDialogStore from "@/shared/stores/useDialogStore";
import { Logger } from "@/shared/utils/errorHandler";
import { useAuth } from "@clerk/clerk-expo";
import React, { createContext, useContext, useEffect } from "react";

interface AppUpdateContextType {
  checkForUpdates: () => Promise<void>;
  isChecking: boolean;
}

const AppUpdateContext = createContext<AppUpdateContextType | undefined>(
  undefined
);

export const useAppUpdateContext = () => {
  const context = useContext(AppUpdateContext);
  if (!context) {
    throw new Error(
      "useAppUpdateContext must be used within an AppUpdateProvider"
    );
  }
  return context;
};

interface AppUpdateProviderProps {
  children: React.ReactNode;
}

export const AppUpdateProvider: React.FC<AppUpdateProviderProps> = ({
  children,
}) => {
  const { isSignedIn } = useAuth();
  const {
    versionInfo,
    isUpdateDialogVisible,
    isChecking,
    checkForUpdates,
    hideUpdateDialog,
    handleUpdateLater,
  } = useAppUpdate();
  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  // Check for updates when user signs in
  useEffect(() => {
    if (isSignedIn) {
      const checkUpdatesAfterSignIn = async () => {
        try {
          Logger.logDebug(
            "User signed in - checking for app updates",
            "APP_UPDATE_PROVIDER"
          );

          // Add a small delay to let the login flow complete
          setTimeout(async () => {
            await checkForUpdates();
          }, 2000);
        } catch (error) {
          Logger.logError(error, "Failed to check updates after sign in");
        }
      };

      checkUpdatesAfterSignIn();
    }
  }, [isSignedIn, checkForUpdates]);

  // Show/hide app update dialog using DialogHost
  useEffect(() => {
    if (isUpdateDialogVisible && versionInfo) {
      const isUpdateRequired = versionInfo.updateRequired;

      openDialog({
        type: "app-update",
        props: {
          versionInfo,
          onUpdateLater: handleUpdateLater,
          headerProps: {
            title: isUpdateRequired
              ? "Update Required"
              : "New Version Available",
            // Don't show close button if update is required
            backAction: !isUpdateRequired,
            onBackAction: !isUpdateRequired ? hideUpdateDialog : undefined,
          },
          enableDragging: false,
          // Prevent closing on background press if update is required
          enableCloseOnBackgroundPress: !isUpdateRequired,
        },
        position: "dock",
      });
    } else {
      // Close the dialog if it should be hidden
      const dialogs = useDialogStore.getState().dialogs;
      const updateDialog = Object.values(dialogs).find(
        (d) => d.type === "app-update"
      );
      if (updateDialog) {
        closeDialog(updateDialog.id);
      }
    }
  }, [
    isUpdateDialogVisible,
    versionInfo,
    openDialog,
    closeDialog,
    hideUpdateDialog,
    handleUpdateLater,
  ]);

  const contextValue: AppUpdateContextType = {
    checkForUpdates,
    isChecking,
  };

  return (
    <AppUpdateContext.Provider value={contextValue}>
      {children}
    </AppUpdateContext.Provider>
  );
};
