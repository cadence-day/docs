import { backgroundLinearColors } from "@/shared/constants/COLORS";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { generalStyles } from "../../shared/styles";

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
      style={generalStyles.container}
    >
      <SafeAreaView style={generalStyles.container}>
        <ProfileScreen />
      </SafeAreaView>
    </LinearGradient>
  );
}
