import { COLORS } from "@/shared/constants/COLORS";
import { useTheme } from "@/shared/hooks";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  isLoading?: boolean;
  toolName?: string;
}

const TOOL_EMOJIS: Record<string, string> = {
  getCurrentDate: "📅",
  getTimeslicesForDate: "⏱️",
  getActivities: "🎯",
  getActivityById: "🔍",
  getUserNotes: "📝",
  getNoteById: "📄",
  getUserStates: "💭",
  getStateById: "🔎",
};

const TOOL_NAMES: Record<string, string> = {
  getCurrentDate: "Time Wizard",
  getTimeslicesForDate: "Time Detective",
  getActivities: "Activity Hunter",
  getActivityById: "Activity Spy",
  getUserNotes: "Note Collector",
  getNoteById: "Note Finder",
  getUserStates: "State Reader",
  getStateById: "State Seeker",
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isLoading = false,
  toolName,
}) => {
  const theme = useTheme();
  const isUser = role === "user";
  const isTool = role === "tool";

  // Tool message styling
  if (isTool) {
    const emoji = toolName ? TOOL_EMOJIS[toolName] || "🔧" : "🔧";
    const funName = toolName
      ? TOOL_NAMES[toolName] || "Tool Caller"
      : "Tool Caller";

    return (
      <View style={[styles.container, styles.toolContainer]}>
        <View
          style={[
            styles.toolBubble,
            { backgroundColor: theme.background.tertiary },
          ]}
        >
          <Text style={[styles.toolText, { color: theme.text.tertiary }]}>
            {emoji}{" "}
            <Text style={styles.italicText}>{funName} is working...</Text>
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? {
                backgroundColor: COLORS.light.ui.tint,
                borderColor: COLORS.light.ui.tint,
              }
            : {
                backgroundColor: theme.background.secondary,
                borderColor: theme.ui.border,
              },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={
              isUser ? COLORS.light.background.primary : theme.text.primary
            }
          />
        ) : (
          <Text
            style={[
              styles.text,
              {
                color: isUser
                  ? COLORS.light.background.primary
                  : theme.text.primary,
              },
            ]}
          >
            {content}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  userContainer: {
    alignItems: "flex-end",
  },
  assistantContainer: {
    alignItems: "flex-start",
  },
  toolContainer: {
    alignItems: "center",
  },
  toolBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: "90%",
    alignSelf: "center",
  },
  toolText: {
    fontSize: 14,
  },
  italicText: {
    fontStyle: "italic",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "80%",
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
});
