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
          letterSpacing: 1,
          color: COLORS.light.text,
          textAlign: "center",
          textDecorationLine: focused ? "underline" : "none",
          fontWeight: focused ? "600" : "400",
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

  // Track current view based on segments
  useEffect(() => {
    const currentView = segments[segments.length - 1] || "index";
    setCurrentView(currentView);
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
              title: t("reflection"),
              tabBarIcon: ({ focused, color }: any) => (
                <TabLabel
                  focused={focused}
                  color={color}
                  label={t("reflection")}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: t("profile"),
              tabBarIcon: ({ focused, color }: any) => (
                <TabLabel
                  focused={focused}
                  color={color}
                  label={t("profile")}
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
