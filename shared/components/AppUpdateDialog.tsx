import React from "react";
import { View, StyleSheet, Platform, Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { CdDialog } from "./CadenceUI/CdDialog";
import { CdText } from "./CadenceUI/CdText";
import { CdButton } from "./CadenceUI/CdButton";
import { useI18n } from "@/shared/hooks/useI18n";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import type { AppVersionInfo } from "@/shared/services/AppUpdateService";

interface AppUpdateDialogProps {
  visible: boolean;
  onClose: () => void;
  versionInfo: AppVersionInfo;
  onUpdateLater?: () => void;
}

export const AppUpdateDialog: React.FC<AppUpdateDialogProps> = ({
  visible,
  onClose,
  versionInfo,
  onUpdateLater,
}) => {
  const { t } = useI18n();

  const isUpdateRequired = versionInfo.updateRequired;

  const handleUpdateNow = async () => {
    try {
      const storeUrl = versionInfo.storeUrl;

      if (!storeUrl) {
        GlobalErrorHandler.logWarning(
          "No store URL available for app update",
          "APP_UPDATE_DIALOG"
        );
        return;
      }

      if (Platform.OS === "ios") {
        // On iOS, open the App Store app directly
        await Linking.openURL(storeUrl);
      } else {
        // On Android, open in web browser or Play Store app
        const supported = await Linking.canOpenURL(storeUrl);
        if (supported) {
          await Linking.openURL(storeUrl);
        } else {
          // Fallback to web browser
          await WebBrowser.openBrowserAsync(storeUrl);
        }
      }

      GlobalErrorHandler.logDebug(
        "User opened app store for update",
        "APP_UPDATE_DIALOG",
        {
          platform: Platform.OS,
          currentVersion: versionInfo.currentVersion,
          latestVersion: versionInfo.latestVersion,
        }
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, "Failed to open app store for update");
    }
  };

  const handleUpdateLater = () => {
    if (!isUpdateRequired) {
      onUpdateLater?.();
      onClose();
    }
    // If update is required, don't close the dialog
  };

  if (!versionInfo.updateAvailable) {
    return null;
  }

  return (
    <CdDialog
      visible={visible}
      onClose={onClose}
      height={40}
      enableDragging={false}
      headerProps={{
        title: isUpdateRequired
          ? t("app-update.update-required")
          : t("app-update.new-version-available"),
        showCloseButton: !isUpdateRequired,
        onClose: isUpdateRequired ? undefined : onClose,
      }}
      enableCloseOnBackgroundPress={!isUpdateRequired}
      isGlobal={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <CdText variant="body" size="medium" style={styles.description}>
            {isUpdateRequired
              ? t("app-update.update-required-description", {
                  currentVersion: versionInfo.currentVersion,
                  latestVersion: versionInfo.latestVersion || "latest",
                })
              : t("app-update.update-description", {
                  currentVersion: versionInfo.currentVersion,
                  latestVersion: versionInfo.latestVersion || "latest",
                })
            }
          </CdText>

          <CdText variant="body" size="small" style={styles.benefits}>
            {isUpdateRequired
              ? t("app-update.update-required-benefits")
              : t("app-update.update-benefits")
            }
          </CdText>
        </View>

        <View style={styles.buttonContainer}>
          <CdButton
            title={t("app-update.update-now")}
            onPress={handleUpdateNow}
            variant="primary"
            size="medium"
            style={styles.updateButton}
          />

          {!isUpdateRequired && (
            <CdButton
              title={t("app-update.update-later")}
              onPress={handleUpdateLater}
              variant="outline"
              size="medium"
              style={styles.laterButton}
            />
          )}
        </View>
      </View>
    </CdDialog>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
  },
  benefits: {
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
    paddingTop: 20,
  },
  updateButton: {
    borderRadius: 8,
  },
  laterButton: {
    borderRadius: 8,
  },
});