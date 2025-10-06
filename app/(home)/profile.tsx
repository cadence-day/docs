import { COLORS } from "@/shared/constants/COLORS";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { generalStyles } from "../../shared/styles";

const ProfileScreen = React.lazy(
  () => import("@/features/profile/components/ProfileScreen")
);

export default function ProfileRoute() {
  return (
    <View
      style={[generalStyles.container, { backgroundColor: COLORS.background }]}
    >
      <SafeAreaView style={generalStyles.container}>
        <ProfileScreen />
      </SafeAreaView>
    </View>
  );
}
