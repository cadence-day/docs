import SageIcon from "@/shared/components/icons/SageIcon";
import React from "react";
import { StyleSheet, View } from "react-native";

// Full-screen loading screen with centered pulsating Sage icon
export default function LoadingScreen() {
  return (
    <View style={styles.container} testID="loading-screen">
      <SageIcon size={150} status={"pulsating"} auto={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
