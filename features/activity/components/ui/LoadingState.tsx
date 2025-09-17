import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { ACTIVITY_THEME } from "../../constants";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
}

export const LoadingState = React.memo<LoadingStateProps>(
  ({ message = "Loading...", size = "large" }) => {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size={size}
          color={ACTIVITY_THEME.SLIDER_FILL}
          style={styles.indicator}
        />
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }
);

LoadingState.displayName = "LoadingState";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  indicator: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: ACTIVITY_THEME.GRAY_LIGHT,
    textAlign: "center",
    fontWeight: "500",
  },
});
