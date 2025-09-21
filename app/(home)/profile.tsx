import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView } from "react-native";

const ProfileScreen = React.lazy(
  () => import("@/features/profile/components/ProfileScreen")
);

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
        }}
      >
        <ProfileScreen />
      </SafeAreaView>
    </LinearGradient>
  );
}
