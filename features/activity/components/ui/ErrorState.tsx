import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ACTIVITY_THEME } from "../../constants";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  showIcon?: boolean;
}

export const ErrorState = React.memo<ErrorStateProps>(
  ({ message, onRetry, retryLabel = "Retry", showIcon = true }) => {
    return (
      <View style={styles.container}>
        {showIcon && (
          <Ionicons
            name="warning-outline"
            size={48}
            color={ACTIVITY_THEME.ERROR_COLOR}
            style={styles.icon}
          />
        )}
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>{retryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

ErrorState.displayName = "ErrorState";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: ACTIVITY_THEME.ERROR_COLOR,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: ACTIVITY_THEME.SLIDER_FILL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: ACTIVITY_THEME.WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
});
