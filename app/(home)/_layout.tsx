import { checkAndPromptEncryptionLinking } from "@/features/encryption/detectNewDevice";
import { revenueCatService } from "@/features/purchases/services/RevenueCatService";
import { DialogHost } from "@/shared/components/DialogHost";
import { COLORS } from "@/shared/constants/COLORS";
import { NAV_BAR_SIZE } from "@/shared/constants/VIEWPORT";
import { HIT_SLOP_24 } from "@/shared/constants/hitSlop";
import useTranslation from "@/shared/hooks/useI18n";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import useDialogStore from "@/shared/stores/useDialogStore";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Tabs, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GlobalErrorHandler } from "../../shared/utils/errorHandler";

// Custom TabLabel component to have more control over the appearance
function TabLabel({
  focused,
  color,
  label,
}: {
  focused: boolean;
  color: string;
  label: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: NAV_BAR_SIZE,
        minWidth: 80,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          color: COLORS.light.text,
          textAlign: "center",
          textDecorationLine: focused ? "underline" : "none",
          fontWeight: focused ? "700" : "400",
          verticalAlign: "middle",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const segments = useSegments();
  const setCurrentView = useDialogStore((state) => state.setCurrentView);
  const { user } = useUser();
  const [didCheckEncryption, setDidCheckEncryption] = React.useState(false);

  // Consolidated effect to track view and manage ActivityLegendDialog
  useEffect(() => {
    const currentSegment = segments[segments.length - 1] || "index";
    const currentView = String(currentSegment ?? "index");

    // Check if we're on the home/index view - could be "index" or undefined (default route)
    const isHomeView =
      currentView === "index" ||
      segments.length === 1 ||
      (segments.length === 2 &&
        segments[0] === "(home)" &&
        !segments.slice(1)[0]);

    // Update the current view in the store
    setCurrentView(currentView);

    // Manage ActivityLegendDialog visibility with a small delay to ensure store is ready
    const timeoutId = setTimeout(() => {
      const dialogStore = useDialogStore.getState();
      const dialogs = dialogStore.dialogs;
      const activityLegendDialog = Object.values(dialogs).find(
        (d) => d.type === "activity-legend"
      );

      if (isHomeView) {
        // Always ensure dialog is open on home/index view
        if (!activityLegendDialog) {
          dialogStore.openDialog({
            type: "activity-legend",
            props: {
              preventClose: true,
            },
            position: "dock",
          });
        }
      } else {
        // Always close dialog on other views
        if (activityLegendDialog) {
          dialogStore.closeDialog(activityLegendDialog.id, true);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [segments, setCurrentView]);

  // On initial mount when signed-in, perform a one-time new-device check
  useEffect(() => {
    if (didCheckEncryption) return;
    // Only probe on the Today tab (index)
    const rawView = segments[segments.length - 1];
    const currentView = String(rawView ?? "index");
    if (currentView !== "index") return;
    const userId = user?.id ?? null;
    (async () => {
      await checkAndPromptEncryptionLinking(userId);
      setDidCheckEncryption(true);
    })();
  }, [user, segments, didCheckEncryption]);

  // Initialize RevenueCat when user is signed in
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    (async () => {
      try {
        await revenueCatService.configure();
        await revenueCatService.login(userId);
      } catch (error) {
        GlobalErrorHandler.logError(error, "Failed to initialize RevenueCat");
      }
    })();
  }, [user?.id]);

  // On initial mount when signed-in, open onboarding if the user has no timeslices
  useEffect(() => {
    // Only run once per mount
    let didRun = false;
    const rawView = segments[segments.length - 1];
    const currentView = String(rawView ?? "index");
    if (currentView !== "index") return;

    const tryOpenOnboarding = async () => {
      if (didRun) return;
      didRun = true;

      const userId = user?.id ?? null;
      if (!userId) return;

      try {
        const shown = await userOnboardingStorage.getShown();
        if (shown) return;

        const timeslices = await useTimeslicesStore
          .getState()
          .getAllTimeslices();
        if (!timeslices || timeslices.length === 0) {
          // Open onboarding dialog with requested props
          useDialogStore.getState().openDialog({
            type: "onboarding",
            props: {
              height: 85,
              enableDragging: false,
              headerProps: {
                title: t("welcome-to-cadence"),
                rightActionElement: t("common.close"),
                onRightAction: () => {
                  useDialogStore.getState().closeAll();
                },
              },
            },
            position: "dock",
            viewSpecific: "profile",
          });
        }
      } catch (err) {
        // Ignore errors here - non-fatal
        GlobalErrorHandler.logWarning(
          "Error checking timeslices for onboarding",
          "ONBOARDING_CHECK",
          { error: err, userId }
        );
      }
    };

    tryOpenOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, segments]);

  return (
    <>
      <SignedIn>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: COLORS.light.text,
            tabBarInactiveTintColor: COLORS.light.text,
            tabBarShowLabel: false,
            headerShown: false,
            tabBarHideOnKeyboard: false,
            tabBarStyle: {
              backgroundColor: COLORS.light.background,
              borderTopWidth: 1,
              borderTopColor: COLORS.light.border,
              height: NAV_BAR_SIZE,
              ...getShadowStyle(ShadowLevel.Low),
            },
            tabBarItemStyle: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "stretch",
              alignContent: "center",
              marginTop: 12,
            },
            // Ensure each tab's touch target is larger via a custom tabBarButton
            tabBarButton: (props: any) => {
              // If the underlying component is provided we wrap it in a TouchableOpacity
              const { children, onPress } = props;
              return (
                <TouchableOpacity
                  onPress={onPress}
                  hitSlop={HIT_SLOP_24}
                  style={{ flex: 1 }}
                >
                  {children}
                </TouchableOpacity>
              );
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t("today"),
              tabBarIcon: ({ focused, color }: any) => (
                <TabLabel focused={focused} color={color} label={t("today")} />
              ),
            }}
          />

          <Tabs.Screen
            name="reflection"
            options={{
              title: t("reflection.title"),
              tabBarIcon: ({ focused, color }: any) => (
                <TabLabel
                  focused={focused}
                  color={color}
                  label={t("reflection.title")}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: t("profile.title"),
              tabBarIcon: ({ focused, color }: any) => (
                <TabLabel
                  focused={focused}
                  color={color}
                  label={t("profile.title")}
                />
              ),
            }}
          />
        </Tabs>
        <DialogHost />
      </SignedIn>

      <SignedOut>
        <Stack screenOptions={{ headerShown: false }} />
      </SignedOut>
    </>
  );
}
