import { Logger } from "@/shared/utils/errorHandler";
import * as Application from "expo-application";
import { Platform } from "react-native";

export interface AppVersionInfo {
  currentVersion: string;
  latestVersion?: string;
  updateAvailable: boolean;
  updateRequired: boolean; // Force update for major/minor versions
  storeUrl?: string;
}

export interface AppStoreResponse {
  results: {
    version: string;
    trackViewUrl: string;
    releaseDate: string;
    releaseNotes: string;
  }[];
}

class AppUpdateService {
  private static instance: AppUpdateService;
  private readonly APP_ID = "6745115112"; // App Store ID for the app
  private readonly APP_STORE_URL =
    `https://apps.apple.com/app/id${this.APP_ID}`;
  private readonly PLAY_STORE_URL =
    "https://play.google.com/store/apps/details?id=day.cadence.mobile";

  private constructor() {}

  static getInstance(): AppUpdateService {
    if (!AppUpdateService.instance) {
      AppUpdateService.instance = new AppUpdateService();
    }
    return AppUpdateService.instance;
  }

  /**
   * Get current app version information
   */
  getCurrentVersion(): string {
    const version = Application.nativeApplicationVersion;
    if (!version) {
      Logger.logWarning(
        "Unable to retrieve current app version",
        "APP_UPDATE_SERVICE",
      );
      return "unknown";
    }
    return version;
  }

  /**
   * Get current build number
   */
  getCurrentBuildNumber(): string {
    const buildNumber = Application.nativeBuildVersion;
    if (!buildNumber) {
      Logger.logWarning(
        "Unable to retrieve current build number",
        "APP_UPDATE_SERVICE",
      );
      return "unknown";
    }
    return buildNumber;
  }

  /**
   * Check for app updates on iOS App Store
   */
  private async checkIOSUpdate(): Promise<AppVersionInfo> {
    const currentVersion = this.getCurrentVersion();

    try {
      const response = await fetch(
        `https://itunes.apple.com/lookup?id=${this.APP_ID}`,
      );

      if (!response.ok) {
        throw new Error(
          `App Store API responded with status ${response.status}`,
        );
      }

      const data: AppStoreResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("No app found in App Store");
      }

      const appData = data.results[0];
      const latestVersion = appData.version;
      const updateAvailable =
        this.compareVersions(currentVersion, latestVersion) < 0;
      const updateRequired = updateAvailable &&
        this.isUpdateRequired(currentVersion, latestVersion);

      Logger.logDebug(
        "iOS App Store version check completed",
        "APP_UPDATE_SERVICE",
        {
          currentVersion,
          latestVersion,
          updateAvailable,
          updateRequired,
          releaseDate: appData.releaseDate,
        },
      );

      return {
        currentVersion,
        latestVersion,
        updateAvailable,
        updateRequired,
        storeUrl: appData.trackViewUrl,
      };
    } catch (error) {
      Logger.logError(
        error,
        "Failed to check iOS App Store for updates",
      );

      return {
        currentVersion,
        updateAvailable: false,
        updateRequired: false,
        storeUrl: this.APP_STORE_URL,
      };
    }
  }

  /**
   * Check for app updates on Android Play Store
   * Note: Play Store doesn't have a public API, so this is a simplified implementation
   */
  private async checkAndroidUpdate(): Promise<AppVersionInfo> {
    const currentVersion = this.getCurrentVersion();

    // For Android, we'll return the current version info with store URL
    // In a production app, you might want to implement a custom backend service
    // that checks the Play Store or use Google's In-App Updates API
    Logger.logDebug(
      "Android Play Store version check - using fallback method",
      "APP_UPDATE_SERVICE",
      { currentVersion },
    );

    return {
      currentVersion,
      updateAvailable: false, // Unable to determine without Play Store API
      updateRequired: false,
      storeUrl: this.PLAY_STORE_URL,
    };
  }

  /**
   * Check for app updates on the respective platform store
   */
  async checkForUpdates(): Promise<AppVersionInfo> {
    try {
      if (Platform.OS === "ios") {
        return await this.checkIOSUpdate();
      } else if (Platform.OS === "android") {
        return await this.checkAndroidUpdate();
      } else {
        throw new Error(`Unsupported platform: ${Platform.OS}`);
      }
    } catch (error) {
      Logger.logError(error, "App update check failed");

      return {
        currentVersion: this.getCurrentVersion(),
        updateAvailable: false,
        updateRequired: false,
      };
    }
  }

  /**
   * Compare two version strings (semver-like comparison)
   * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const v1parts = v1.split(".").map(Number);
    const v2parts = v2.split(".").map(Number);

    const maxLength = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }

  /**
   * Determine if an update is required (force update)
   * Returns true for major (x) or minor (y) version changes
   * Returns false for patch (z) version changes only
   */
  private isUpdateRequired(
    currentVersion: string,
    latestVersion: string,
  ): boolean {
    const currentParts = currentVersion.split(".").map(Number);
    const latestParts = latestVersion.split(".").map(Number);

    // Ensure we have at least major.minor.patch format
    while (currentParts.length < 3) currentParts.push(0);
    while (latestParts.length < 3) latestParts.push(0);

    const [currentMajor, currentMinor] = currentParts;
    const [latestMajor, latestMinor] = latestParts;

    // Force update if major or minor version changed
    const majorChanged = latestMajor > currentMajor;
    const minorChanged = latestMajor === currentMajor &&
      latestMinor > currentMinor;

    const isRequired = majorChanged || minorChanged;

    Logger.logDebug(
      "Update requirement check",
      "APP_UPDATE_SERVICE",
      {
        currentVersion,
        latestVersion,
        majorChanged,
        minorChanged,
        isRequired,
      },
    );

    return isRequired;
  }

  /**
   * Open the app store for the current platform
   */
  getStoreUrl(): string {
    if (Platform.OS === "ios") {
      return this.APP_STORE_URL;
    } else if (Platform.OS === "android") {
      return this.PLAY_STORE_URL;
    }
    return this.APP_STORE_URL; // Default fallback
  }
}

export const appUpdateService = AppUpdateService.getInstance();
