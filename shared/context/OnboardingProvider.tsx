import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import { userVersionStorage } from "@/shared/storage/user/version";
import useDialogStore from "@/shared/stores/useDialogStore";
import { Logger } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import * as Application from "expo-application";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const hasCheckedOnboarding = useRef<string | null>(null);
  const hasCheckedVersion = useRef<string | null>(null);

  // Check onboarding status when user is authenticated
  useEffect(() => {
    if (!isLoaded) return;

    const userId = user?.id;
    if (!userId) {
      // Reset checks when user logs out
      hasCheckedOnboarding.current = null;
      hasCheckedVersion.current = null;
      return;
    }

    // Only check once per user
    if (hasCheckedOnboarding.current === userId) return;

    const checkOnboarding = async () => {
      try {
        Logger.logDebug(
          "Checking if onboarding should be shown",
          "ONBOARDING_PROVIDER",
          { userId }
        );

        const shown = await userOnboardingStorage.getShown();

        Logger.logDebug(
          "Onboarding storage check complete",
          "ONBOARDING_PROVIDER",
          { userId, shown }
        );

        if (!shown) {
          Logger.logDebug(
            "Onboarding not shown yet - navigating to onboarding",
            "ONBOARDING_PROVIDER",
            { userId }
          );

          // Wait a bit to ensure router is ready
          setTimeout(() => {
            router.replace("/onboarding");
          }, 100);
        } else {
          Logger.logDebug(
            "Onboarding already shown - skipping",
            "ONBOARDING_PROVIDER",
            { userId }
          );
        }
      } catch (err) {
        Logger.logError(err, "Error checking onboarding status", {
          userId,
        });
      } finally {
        hasCheckedOnboarding.current = userId;
      }
    };

    checkOnboarding();
  }, [user?.id, isLoaded, router]);

  // Check version changes when user is authenticated and on home screen
  useEffect(() => {
    if (!isLoaded) return;

    const userId = user?.id;
    if (!userId) {
      hasCheckedVersion.current = null;
      return;
    }

    // Only check version when on the home/index screen
    const inAuthGroup = segments[0] === "(home)";
    const currentPage = segments[segments.length - 1] as string | undefined;
    const onIndexPage =
      !currentPage || currentPage === "index" || segments.length === 1;

    if (!inAuthGroup || !onIndexPage) return;

    // Only check once per user
    if (hasCheckedVersion.current === userId) return;

    const checkVersionChange = async () => {
      try {
        const currentVersion =
          Application.nativeApplicationVersion || "unknown";
        const lastSeenVersion = await userVersionStorage.getLastSeenVersion();

        Logger.logDebug("Version check complete", "ONBOARDING_PROVIDER", {
          userId,
          currentVersion,
          lastSeenVersion,
        });

        // If there's a last seen version and it's different from current, show update dialog
        if (lastSeenVersion && lastSeenVersion !== currentVersion) {
          Logger.logDebug(
            "Version changed - showing update dialog",
            "ONBOARDING_PROVIDER",
            {
              userId,
              oldVersion: lastSeenVersion,
              newVersion: currentVersion,
            }
          );

          // Open update changelog dialog
          const dialogStore = useDialogStore.getState();
          dialogStore.openDialog({
            type: "app-update",
            props: {
              versionInfo: {
                updateAvailable: true,
                updateRequired: false,
                currentVersion: lastSeenVersion,
                latestVersion: currentVersion,
              },
              onUpdateLater: async () => {
                // Mark version as seen when user dismisses the dialog
                await userVersionStorage.setLastSeenVersion(currentVersion);
                dialogStore.closeAll();
              },
              headerProps: {
                title: "New Version Available",
                backAction: true,
              },
              enableDragging: true,
            },
            position: "dock",
          });
        }

        // Always update the last seen version to current version
        await userVersionStorage.setLastSeenVersion(currentVersion);
      } catch (err) {
        Logger.logError(err, "Error checking version", {
          userId,
        });
      } finally {
        hasCheckedVersion.current = userId;
      }
    };

    checkVersionChange();
  }, [user?.id, isLoaded, segments]);

  return <>{children}</>;
};
