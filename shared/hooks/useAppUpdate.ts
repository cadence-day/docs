import {
  appUpdateService,
  type AppVersionInfo,
} from "@/shared/services/AppUpdateService";
import { Logger } from "@/shared/utils/errorHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const UPDATE_LATER_STORAGE_KEY = "app_update_later_timestamp";
const LAST_UPDATE_CHECK_KEY = "last_app_update_check";

export interface UseAppUpdateReturn {
  versionInfo: AppVersionInfo | null;
  isUpdateDialogVisible: boolean;
  isChecking: boolean;
  checkForUpdates: () => Promise<void>;
  showUpdateDialog: () => void;
  hideUpdateDialog: () => void;
  handleUpdateLater: () => Promise<void>;
}

export const useAppUpdate = (): UseAppUpdateReturn => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [isUpdateDialogVisible, setIsUpdateDialogVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const shouldCheckForUpdates = useCallback(async (): Promise<boolean> => {
    try {
      const lastCheckTimestamp = await AsyncStorage.getItem(
        LAST_UPDATE_CHECK_KEY,
      );
      const updateLaterTimestamp = await AsyncStorage.getItem(
        UPDATE_LATER_STORAGE_KEY,
      );

      const now = Date.now();

      // Check if we've checked recently
      if (lastCheckTimestamp) {
        const timeSinceLastCheck = now - parseInt(lastCheckTimestamp, 10);
        if (timeSinceLastCheck < UPDATE_CHECK_INTERVAL) {
          Logger.logDebug(
            "Skipping update check - too recent",
            "APP_UPDATE_HOOK",
            { timeSinceLastCheck, interval: UPDATE_CHECK_INTERVAL },
          );
          return false;
        }
      }

      // Check if user clicked "Update Later" recently (respect for 24 hours)
      if (updateLaterTimestamp) {
        const timeSinceUpdateLater = now - parseInt(updateLaterTimestamp, 10);
        if (timeSinceUpdateLater < UPDATE_CHECK_INTERVAL) {
          Logger.logDebug(
            "Skipping update check - user chose 'Update Later' recently",
            "APP_UPDATE_HOOK",
            { timeSinceUpdateLater, interval: UPDATE_CHECK_INTERVAL },
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      Logger.logError(error, "Failed to check update timing");
      return true; // Default to checking if we can't determine timing
    }
  }, []);

  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (isChecking) {
      return; // Prevent concurrent checks
    }

    const shouldCheck = await shouldCheckForUpdates();
    if (!shouldCheck) {
      return;
    }

    setIsChecking(true);

    try {
      Logger.logDebug(
        "Starting app update check",
        "APP_UPDATE_HOOK",
      );

      const updateInfo = await appUpdateService.checkForUpdates();
      setVersionInfo(updateInfo);

      // Store the timestamp of this check
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());

      if (updateInfo.updateAvailable) {
        Logger.logDebug(
          "App update available",
          "APP_UPDATE_HOOK",
          {
            currentVersion: updateInfo.currentVersion,
            latestVersion: updateInfo.latestVersion,
          },
        );
        setIsUpdateDialogVisible(true);
      } else {
        Logger.logDebug(
          "App is up to date",
          "APP_UPDATE_HOOK",
          { currentVersion: updateInfo.currentVersion },
        );
      }
    } catch (error) {
      Logger.logError(error, "App update check failed");
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, shouldCheckForUpdates]);

  const showUpdateDialog = useCallback(() => {
    setIsUpdateDialogVisible(true);
  }, []);

  const hideUpdateDialog = useCallback(() => {
    setIsUpdateDialogVisible(false);
  }, []);

  const handleUpdateLater = useCallback(async (): Promise<void> => {
    try {
      // Store timestamp when user chose "Update Later"
      await AsyncStorage.setItem(
        UPDATE_LATER_STORAGE_KEY,
        Date.now().toString(),
      );

      Logger.logDebug(
        "User chose to update later",
        "APP_UPDATE_HOOK",
      );

      setIsUpdateDialogVisible(false);
    } catch (error) {
      Logger.logError(error, "Failed to store update later timestamp");
      setIsUpdateDialogVisible(false);
    }
  }, []);

  // Check for updates when app comes to foreground
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground, check for updates
        checkForUpdates();
      }
      appStateRef.current = nextAppState;
    },
    [checkForUpdates],
  );

  // Set up app state listener
  React.useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, [handleAppStateChange]);

  return {
    versionInfo,
    isUpdateDialogVisible,
    isChecking,
    checkForUpdates,
    showUpdateDialog,
    hideUpdateDialog,
    handleUpdateLater,
  };
};
