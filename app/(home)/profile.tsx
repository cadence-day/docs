import React from "react";
import { SafeAreaView, View } from "react-native";
import ProfileScreen from "@/features/profile/components/ProfileScreen";

export default function ProfileRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ProfileScreen />
      </View>
    </SafeAreaView>
  );
}
