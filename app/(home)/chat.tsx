import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { ChatScreen } from "@/features/chat/components/ChatScreen";
import { useTheme } from "@/shared/hooks";
import { usePostHog } from "posthog-react-native";

export default function ChatPage() {
  const theme = useTheme();
  const posthog = usePostHog();
  const [isChatEnabled, setIsChatEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the 'chat' feature flag is enabled
    const checkFeatureFlag = async () => {
      try {
        const isEnabled = await posthog?.isFeatureEnabled("chat");
        setIsChatEnabled(isEnabled ?? false);
      } catch (error) {
        console.error("Error checking feature flag:", error);
        setIsChatEnabled(false);
      }
    };

    checkFeatureFlag();
  }, [posthog]);

  // Show loading state while checking feature flag
  if (isChatEnabled === null) {
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
