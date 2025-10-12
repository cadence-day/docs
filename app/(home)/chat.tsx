import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ChatScreen } from "@/features/chat/components/ChatScreen";
import { useTheme } from "@/shared/hooks";
import { useFeatureFlag } from "@/shared/hooks/useFeatureFlags";

export default function ChatPage() {
  const theme = useTheme();
  const isChatEnabled = useFeatureFlag("chat");

  // Show loading state while checking feature flag
  if (isChatEnabled === undefined) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <ActivityIndicator size="large" color={theme.text.primary} />
      </View>
    );
  }

  // Show feature not available message if flag is disabled
  if (!isChatEnabled) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <Text style={[styles.disabledTitle, { color: theme.text.primary }]}>
          Chat Feature Not Available
        </Text>
        <Text style={[styles.disabledText, { color: theme.text.secondary }]}>
          This feature is currently disabled. Please check back later.
        </Text>
      </View>
    );
  }

  // Render chat screen if feature is enabled
  return <ChatScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  disabledTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  disabledText: {
    fontSize: 16,
    textAlign: "center",
  },
});
