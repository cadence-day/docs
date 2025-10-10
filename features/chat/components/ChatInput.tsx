import { COLORS } from "@/shared/constants/COLORS";
import { useTheme } from "@/shared/hooks";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "How was my day?",
}) => {
  const [input, setInput] = useState("");
  const theme = useTheme();

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.secondary },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.primary,
              color: theme.text.primary,
              borderColor: theme.ui.border,
            },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor:
                input.trim() && !disabled
                  ? COLORS.light.ui.tint
                  : theme.ui.border,
            },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || disabled}
        >
          <View style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    alignItems: "flex-end",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: COLORS.light.background.primary,
    borderRightColor: "transparent",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 3,
  },
});
