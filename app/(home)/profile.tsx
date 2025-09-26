import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

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
      style={style.container}
    >
      <SafeAreaView style={style.safeAreaContainer}>
        <ProfileScreen />
      </SafeAreaView>
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
