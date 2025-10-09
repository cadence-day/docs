import {
  getEncryptionKeyWithSource,
  getKeyFingerprint,
  hasEncryptionKey,
  setEncryptedDataDetectedCallback,
  setEncryptionKeyChangedCallback,
} from "@/shared/api/encryption/core";
import { BaseStorage } from "@/shared/storage/base";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Application from "expo-application";
import * as Device from "expo-device";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

// Storage for device identification and encryption state
class EncryptionStorage extends BaseStorage {
  constructor() {
    super("encryption");
  }

  async getDeviceId(): Promise<string> {
    const result = await this.get("device_id", "");
    return result.data || "";
  }

  async setDeviceId(deviceId: string): Promise<void> {
    await this.set("device_id", deviceId);
  }

  async getKeyFingerprint(): Promise<string> {
    const result = await this.get("key_fingerprint", "");
    return result.data || "";
  }

  async setKeyFingerprint(fingerprint: string): Promise<void> {
    await this.set("key_fingerprint", fingerprint);
  }

  async getHasSeenLinkDialog(): Promise<boolean> {
    const result = await this.get("has_seen_link_dialog", false);
    return result.data || false;
  }

  async setHasSeenLinkDialog(hasSeen: boolean): Promise<void> {
    await this.set("has_seen_link_dialog", hasSeen);
  }

  async getEncryptedDataDetected(): Promise<boolean> {
    const result = await this.get("encrypted_data_detected", false);
    return result.data || false;
  }

  async setEncryptedDataDetected(detected: boolean): Promise<void> {
    await this.set("encrypted_data_detected", detected);
  }

  async getVisualizationMode(): Promise<boolean> {
    const result = await this.get("visualization_mode", false);
    return result.data || false;
  }

  async setVisualizationMode(enabled: boolean): Promise<void> {
    await this.set("visualization_mode", enabled);
  }

  async getShowEncryptedAsStars(): Promise<boolean> {
    const result = await this.get("show_encrypted_as_stars", true);
    return result.data !== false; // Default to true
  }

  async setShowEncryptedAsStars(enabled: boolean): Promise<void> {
    await this.set("show_encrypted_as_stars", enabled);
  }
}

interface EncryptionContextValue {
  // State
  hasKey: boolean;
  keyFingerprint: string | null;
  keySource: "securestore" | "asyncstorage" | "ephemeral" | null;
  isNewDevice: boolean;
  encryptedDataDetected: boolean;
  isCheckingKey: boolean;

  // Debug/Visualization state
  isVisualizationMode: boolean;
  showEncryptedAsStars: boolean;

  // Actions
  refreshEncryptionState: () => Promise<void>;
  markEncryptedDataDetected: () => Promise<void>;
  onKeyImported: () => Promise<void>;
  showLinkDialog: () => void;
  dismissNewDeviceDetection: () => Promise<void>;

  // Debug/Visualization actions
  toggleVisualizationMode: () => void;
  toggleEncryptedDisplay: () => void;
}

const EncryptionContext = createContext<EncryptionContextValue | undefined>(
  undefined
);

const encryptionStorage = new EncryptionStorage();

// Generate a unique device identifier
async function generateDeviceId(): Promise<string> {
  try {
    // Use expo-application and expo-device to create a unique identifier
    let installId = "unknown";
    if (Platform.OS === "android") {
      installId = (await Application.getAndroidId()) || "unknown";
    } else if (Platform.OS === "ios") {
      installId = (await Application.getIosIdForVendorAsync()) || "unknown";
    } else {
      installId = "unknown";
    }
    const deviceName = Device.deviceName || "unknown";
    const modelName = Device.modelName || "unknown";
    const osVersion = Device.osVersion || "unknown";

    // Create a semi-persistent device ID (will persist across app sessions but not device resets)
    const deviceId =
      `${installId}_${deviceName}_${modelName}_${osVersion}`.replace(
        /[^a-zA-Z0-9_]/g,
        "_"
      );
    return deviceId;
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_DEVICE_ID_GENERATION", {});
    // Fallback to timestamp-based ID
    return `device_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

export const EncryptionProvider = ({ children }: { children: ReactNode }) => {
  const [hasKey, setHasKey] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState<string | null>(null);
  const [keySource, setKeySource] = useState<
    "securestore" | "asyncstorage" | "ephemeral" | null
  >(null);
  const [isNewDevice, setIsNewDevice] = useState(false);
  const [encryptedDataDetected, setEncryptedDataDetected] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // Debug/Visualization state
  const [isVisualizationMode, setIsVisualizationMode] = useState(false);
  const [showEncryptedAsStars, setShowEncryptedAsStars] = useState(true);

  const refreshEncryptionState = useCallback(async (): Promise<void> => {
    try {
      setIsCheckingKey(true);

      // Check if encryption key exists
      const keyExists = await hasEncryptionKey();
      setHasKey(keyExists);

      if (keyExists) {
        // Get key details
        const { key, source } = await getEncryptionKeyWithSource();
        const fingerprint = getKeyFingerprint(key);

        setKeyFingerprint(fingerprint);
        setKeySource(source);

        // Store current fingerprint for future reference
        await encryptionStorage.setKeyFingerprint(fingerprint);
      } else {
        setKeyFingerprint(null);
        setKeySource(null);
      }

      // Check for encrypted data detection
      const dataDetected = await encryptionStorage.getEncryptedDataDetected();
      setEncryptedDataDetected(dataDetected);
    } catch (error) {
      GlobalErrorHandler.logError(error, "ENCRYPTION_STATE_REFRESH_FAILED", {});
    } finally {
      setIsCheckingKey(false);
    }
  }, []);

  // Check if this is a new device
  const checkNewDevice = useCallback(async (): Promise<void> => {
    try {
      // Get or create device ID
      let deviceId = await encryptionStorage.getDeviceId();
      if (!deviceId) {
        deviceId = await generateDeviceId();
        await encryptionStorage.setDeviceId(deviceId);
        GlobalErrorHandler.logWarning(
          "New device ID generated",
          "ENCRYPTION_NEW_DEVICE_ID",
          { deviceId }
        );
      }

      // Check if we have seen the link dialog on this device
      const hasSeenDialog = await encryptionStorage.getHasSeenLinkDialog();
      const keyExists = await hasEncryptionKey();
      const dataDetected = await encryptionStorage.getEncryptedDataDetected();

      // Consider it a new device if:
      // 1. No encryption key exists AND
      // 2. Encrypted data has been detected AND
      // 3. User hasn't seen the link dialog yet
      const isNew = !keyExists && dataDetected && !hasSeenDialog;

      setIsNewDevice(isNew);

      if (isNew) {
        GlobalErrorHandler.logWarning(
          "New device detected with encrypted data",
          "ENCRYPTION_NEW_DEVICE_DETECTED",
          { deviceId, hasSeenDialog, keyExists, dataDetected }
        );
      }
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_NEW_DEVICE_CHECK_FAILED",
        {}
      );
      setIsNewDevice(false);
    }
  }, []);

  const markEncryptedDataDetected = useCallback(async (): Promise<void> => {
    try {
      await encryptionStorage.setEncryptedDataDetected(true);
      setEncryptedDataDetected(true);

      // Re-check new device status
      await checkNewDevice();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_MARK_DATA_DETECTED_FAILED",
        {}
      );
    }
  }, [checkNewDevice]);

  // Initialize visualization settings
  const initializeVisualizationSettings =
    useCallback(async (): Promise<void> => {
      try {
        const visualizationMode =
          await encryptionStorage.getVisualizationMode();
        const encryptedAsStars =
          await encryptionStorage.getShowEncryptedAsStars();

        setIsVisualizationMode(visualizationMode);
        setShowEncryptedAsStars(encryptedAsStars);
      } catch (error) {
        GlobalErrorHandler.logError(
          error,
          "ENCRYPTION_INIT_VISUALIZATION_FAILED",
          {}
        );
      }
    }, []);

  // Toggle functions
  const toggleVisualizationMode = useCallback(async (): Promise<void> => {
    try {
      const newMode = !isVisualizationMode;
      setIsVisualizationMode(newMode);
      await encryptionStorage.setVisualizationMode(newMode);

      GlobalErrorHandler.logWarning(
        `Visualization mode ${newMode ? "enabled" : "disabled"}`,
        "ENCRYPTION_VISUALIZATION_TOGGLE",
        { mode: newMode }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_TOGGLE_VISUALIZATION_FAILED",
        {}
      );
    }
  }, [isVisualizationMode]);

  const toggleEncryptedDisplay = useCallback(async (): Promise<void> => {
    try {
      const newDisplay = !showEncryptedAsStars;
      setShowEncryptedAsStars(newDisplay);
      await encryptionStorage.setShowEncryptedAsStars(newDisplay);

      GlobalErrorHandler.logWarning(
        `Encrypted display ${newDisplay ? "as stars" : "as binary"}`,
        "ENCRYPTION_DISPLAY_TOGGLE",
        { showAsStars: newDisplay }
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_TOGGLE_DISPLAY_FAILED",
        {}
      );
    }
  }, [showEncryptedAsStars]);

  // Initialize encryption state on mount
  useEffect(() => {
    const initializeEncryption = async () => {
      await refreshEncryptionState();
      await checkNewDevice();
      await initializeVisualizationSettings();
    };

    initializeEncryption();

    // Register callbacks for encrypted data detection and key changes
    setEncryptedDataDetectedCallback(() => {
      markEncryptedDataDetected();
    });

    setEncryptionKeyChangedCallback(async () => {
      // The core has already refreshed stores, we just need to update our state
      await refreshEncryptionState();
    });

    // Cleanup on unmount
    return () => {
      setEncryptedDataDetectedCallback(null);
      setEncryptionKeyChangedCallback(null);
    };
  }, [
    refreshEncryptionState,
    checkNewDevice,
    markEncryptedDataDetected,
    initializeVisualizationSettings,
  ]);

  const onKeyImported = useCallback(async (): Promise<void> => {
    try {
      // Mark that user has seen the link dialog
      await encryptionStorage.setHasSeenLinkDialog(true);

      // Refresh encryption state to get new key info
      await refreshEncryptionState();

      // Update new device status
      setIsNewDevice(false);

      GlobalErrorHandler.logWarning(
        "Encryption key imported successfully",
        "ENCRYPTION_KEY_IMPORTED",
        {}
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_KEY_IMPORT_CALLBACK_FAILED",
        {}
      );
    }
  }, [refreshEncryptionState]);

  const showLinkDialog = useCallback((): void => {
    try {
      const dialogStore = useDialogStore.getState();

      dialogStore.openDialog({
        type: "encryption-link",
        props: {
          onConfirm: onKeyImported,
          headerProps: {
            title: "Link This Device",
            subtitle: "Import your encryption key to access encrypted data",
          },
        },
      });

      GlobalErrorHandler.logWarning(
        "Encryption link dialog opened",
        "ENCRYPTION_DIALOG_OPENED",
        {}
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "ENCRYPTION_SHOW_DIALOG_FAILED", {});
    }
  }, [onKeyImported]);

  const dismissNewDeviceDetection = useCallback(async (): Promise<void> => {
    try {
      await encryptionStorage.setHasSeenLinkDialog(true);
      setIsNewDevice(false);

      GlobalErrorHandler.logWarning(
        "New device detection dismissed",
        "ENCRYPTION_NEW_DEVICE_DISMISSED",
        {}
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_DISMISS_NEW_DEVICE_FAILED",
        {}
      );
    }
  }, []);

  // Auto-show link dialog for new devices with encrypted data
  useEffect(() => {
    if (isNewDevice && encryptedDataDetected && !hasKey) {
      const timer = setTimeout(() => {
        showLinkDialog();
      }, 1000); // Small delay to ensure UI is ready

      return () => clearTimeout(timer);
    }
  }, [isNewDevice, encryptedDataDetected, hasKey, showLinkDialog]);

  const value: EncryptionContextValue = {
    hasKey,
    keyFingerprint,
    keySource,
    isNewDevice,
    encryptedDataDetected,
    isCheckingKey,
    isVisualizationMode,
    showEncryptedAsStars,
    refreshEncryptionState,
    markEncryptedDataDetected,
    onKeyImported,
    showLinkDialog,
    dismissNewDeviceDetection,
    toggleVisualizationMode,
    toggleEncryptedDisplay,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};

export const useEncryption = () => {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error("useEncryption must be used within an EncryptionProvider");
  }
  return context;
};
