import { checkAndPromptEncryptionLinking } from "@/features/encryption/utils/detectNewDevice";
import { DialogHost } from "@/shared/components/DialogHost";
import { COLORS } from "@/shared/constants/COLORS";
import { useNavBarSize } from "@/shared/constants/VIEWPORT";
import { HIT_SLOP_24 } from "@/shared/constants/hitSlop";
import useTranslation from "@/shared/hooks/useI18n";
import { userOnboardingStorage } from "@/shared/storage/user/onboarding";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import useDialogStore from "@/shared/stores/useDialogStore";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GlobalErrorHandler } from "../../shared/utils/errorHandler";

// Custom TabLabel component to have more control over the appearance
function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <View style={styles.tabLabelContainer}>
      <Text
        style={[styles.tabLabelText, focused && styles.tabLabelTextFocused]}
      >
        {label}
      </Text>
    </View>
  );
}

interface TabBarIconProps {
  focused: boolean;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const segments = useSegments();
  const router = useRouter();
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
          // Navigate to full-screen onboarding instead of opening dialog
          router.replace("/onboarding");
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
              height: useNavBarSize(),
              ...getShadowStyle(ShadowLevel.Low),
              justifyContent: "center", // Center content vertically
              alignItems: "center", // Center content horizontally
            },
            tabBarItemStyle: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "stretch",
              alignContent: "center",
            },
            // Ensure each tab's touch target is larger via a custom tabBarButton
            tabBarButton: (props: BottomTabBarButtonProps) => {
              const { children, onPress } = props;
              return (
                <TouchableOpacity
                  onPress={onPress}
                  hitSlop={HIT_SLOP_24}
                  style={[
                    styles.container,
                    { justifyContent: "center", alignItems: "center" },
                  ]}
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
              tabBarIcon: ({ focused }: TabBarIconProps) => (
                <TabLabel focused={focused} label={t("today")} />
              ),
            }}
          />

          <Tabs.Screen
            name="reflection"
            options={{
              title: t("reflection.title"),
              tabBarIcon: ({ focused }: TabBarIconProps) => (
                <TabLabel focused={focused} label={t("reflection.title")} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: t("profile.title"),
              tabBarIcon: ({ focused }: TabBarIconProps) => (
                <TabLabel focused={focused} label={t("profile.title")} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabLabelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  tabLabelText: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: COLORS.light.text,
    textAlign: "center",
    fontWeight: "400",
    verticalAlign: "middle",
  },
  tabLabelTextFocused: {
    textDecorationLine: "underline",
    fontWeight: "700",
  },
});
