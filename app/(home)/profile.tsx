import ProfileScreen from "@/features/profile/components/ProfileScreen";
import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView } from "react-native";

export default function ProfileRoute() {
  return (
    <LinearGradient
      colors={[
        backgroundLinearColors.primary.end,
        backgroundLinearColors.primary.end,
      ]}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 10,
          margin: 12,
        }}
      >
        <ProfileScreen />
      </SafeAreaView>
    </LinearGradient>
  );
}
