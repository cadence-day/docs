import { Link } from "expo-router";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function ProfileRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Profile content goes here */}
        <Text>Profile Screen</Text>
        <Link href="/(utils)/debug">
          <Text>Debug Screen</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}
