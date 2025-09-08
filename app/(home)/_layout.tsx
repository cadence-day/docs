import { DialogHost } from "@/shared/components/DialogHost";
import { COLORS } from "@/shared/constants/COLORS";
import { NAV_BAR_SIZE } from "@/shared/constants/VIEWPORT";
import { useI18n } from "@/shared/hooks/useI18n";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Tabs, useSegments } from "expo-router";
import { Stack } from "expo-router/stack";
import React from "react";
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
  const { t } = useI18n();
  const segments = useSegments();

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
              paddingVertical: 0,
              paddingHorizontal: 0,
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
