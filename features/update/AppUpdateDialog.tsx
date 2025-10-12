import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { useI18n } from "@/shared/hooks/useI18n";
import type { AppVersionInfo } from "@/shared/services/AppUpdateService";
import { Logger } from "@/shared/utils/errorHandler";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Linking, Platform, StyleSheet, View } from "react-native";
import { CdButton } from "../../shared/components/CadenceUI/CdButton";
import { CdText } from "../../shared/components/CadenceUI/CdText";

export interface AppUpdateDialogProps {
  versionInfo: AppVersionInfo;
  onUpdateLater?: () => void;
  _dialogId?: string; // Injected by DialogHost
}

export const AppUpdateDialog: React.FC<AppUpdateDialogProps> = ({
  versionInfo,
  onUpdateLater,
}) => {
  const { t } = useI18n();

  const isUpdateRequired = versionInfo.updateRequired;

  const handleUpdateNow = async () => {
    try {
      const storeUrl = versionInfo.storeUrl;

      if (!storeUrl) {
        Logger.logWarning(
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

      Logger.logDebug("User opened app store for update", "APP_UPDATE_DIALOG", {
        platform: Platform.OS,
        currentVersion: versionInfo.currentVersion,
        latestVersion: versionInfo.latestVersion,
      });
    } catch (error) {
      Logger.logError(error, "Failed to open app store for update");
    }
  };

  const handleUpdateLater = () => {
    if (!isUpdateRequired && onUpdateLater) {
      onUpdateLater();
    }
  };

  if (!versionInfo.updateAvailable) {
    return null;
  }

  return (
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
              })}
        </CdText>

        <CdText variant="body" size="small" style={styles.benefits}>
          {isUpdateRequired
            ? t("app-update.update-required-benefits")
            : t("app-update.update-benefits")}
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
  );
};

const styles = StyleSheet.create({
  container: {
    ...CONTAINER.layout.flex.grow,
    ...CONTAINER.layout.justify.between,
    ...CONTAINER.padding.vertical.lg,
  },
  content: {
    ...CONTAINER.layout.flex.grow,
    ...CONTAINER.gap.lg,
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
  },
  benefits: {
    textAlign: "center",
    ...CONTAINER.opacity.high,
    lineHeight: TYPOGRAPHY.lineHeights.base,
  },
  buttonContainer: {
    ...CONTAINER.gap.md,
    ...CONTAINER.padding.top.xl,
  },
  updateButton: {
    ...CONTAINER.border.radius.base,
  },
  laterButton: {
    ...CONTAINER.border.radius.base,
  },
});

export default AppUpdateDialog;
