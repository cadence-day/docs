import { checkAndPromptEncryptionLinking } from "@/features/encryption/detectNewDevice";
import { DialogHost } from "@/shared/components/DialogHost";
import { COLORS } from "@/shared/constants/COLORS";
import { NAV_BAR_SIZE } from "@/shared/constants/VIEWPORT";
import useTranslation from "@/shared/hooks/useI18n";
import useDialogStore from "@/shared/stores/useDialogStore";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Tabs, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

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

      console.log(
        `[Dialog Manager] Segments: [${segments.join(", ")}], Current view: ${currentView}, Is Home: ${isHomeView}, Dialog exists: ${!!activityLegendDialog}`
      );

      if (isHomeView) {
        // Always ensure dialog is open on home/index view
        if (!activityLegendDialog) {
          console.log(
            "[Dialog Manager] Opening activity legend dialog for home view"
          );
          dialogStore.openDialog({
            type: "activity-legend",
            props: {
              preventClose: true,
            },
            position: "dock",
          });
        } else {
          console.log(
            "[Dialog Manager] Activity legend dialog already exists on home view"
          );
        }
      } else {
        // Always close dialog on other views
        if (activityLegendDialog) {
          console.log(
            "[Dialog Manager] Closing activity legend dialog (not on home view)"
          );
          dialogStore.closeDialog(activityLegendDialog.id, true);
        } else {
          console.log("[Dialog Manager] No activity legend dialog to close");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, segments, didCheckEncryption]);

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
              elevation: 10, // Android shadow
              shadowOffset: { width: 0, height: -2 }, // iOS shadow
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            tabBarItemStyle: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "stretch",
              alignContent: "center",
              marginTop: 12,
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
