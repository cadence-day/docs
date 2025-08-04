import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EmptyScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is an empty screen.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 18,
    color: "#888",
  },
});

export default EmptyScreen;
