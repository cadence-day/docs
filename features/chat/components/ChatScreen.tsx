import { ScreenHeader } from "@/shared/components/CadenceUI";
import { SECRETS } from "@/shared/constants/SECRETS";
import { useTheme } from "@/shared/hooks";
import { Logger } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

interface ToolCall {
  id: string;
  name: string;
  input: unknown;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: ToolCall[];
  toolName?: string;
  isStreaming?: boolean;
}

export const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useUser();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle new chat
  const handleNewChat = () => {
    if (isGenerating) return; // Don't allow new chat while generating
    setMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !SECRETS.EXPO_PUBLIC_OPENAI_API_KEY) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    // Create assistant message ID
    const assistantId = (Date.now() + 1).toString();

    // Add streaming indicator
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...messages
              .filter((m) => m.role !== "tool" && m.content.trim().length > 0)
              .map((m) => ({
                role: m.role,
                content: m.content,
              })),
            { role: "user", content: text.trim() },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          Logger.logDebug(`Raw chunk received`, "ChatScreen", {
            chunkLength: chunk.length,
            linesCount: lines.length,
            firstLine: lines[0]?.substring(0, 100) || "empty",
            allLines: lines.slice(0, 5).map((l) => l.substring(0, 50)),
          });

          for (const line of lines) {
            if (line.startsWith("0:")) {
              // Text chunk
              const text = line.substring(2).replace(/^"(.*)"$/, "$1");
              accumulatedText += text;

              Logger.logDebug(`Text chunk received`, "ChatScreen", {
                rawLine: line.substring(0, 50),
                parsedText: text.substring(0, 50),
                accumulatedLength: accumulatedText.length,
              });

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId
                    ? { ...msg, content: accumulatedText, isStreaming: true }
                    : msg
                )
              );
            } else if (line.startsWith("9:")) {
              // Tool call
              try {
                const toolData = JSON.parse(line.substring(2));
                Logger.logDebug(
                  `Tool called: ${toolData.toolName}`,
                  "ChatScreen",
                  {
                    toolCallId: toolData.toolCallId,
                    args: toolData.args,
                  }
                );

                // Add tool invocation message
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `tool-${toolData.toolCallId}`,
                    role: "tool",
                    content: `🔧 Calling tool: ${toolData.toolName}`,
                    toolName: toolData.toolName,
                  },
                ]);
              } catch (e) {
                Logger.logError(e, "ChatScreen.parseToolCall");
              }
            } else if (line.startsWith("a:")) {
              // Tool result
              try {
                const resultData = JSON.parse(line.substring(2));
                Logger.logDebug(
                  `Tool result: ${resultData.toolName}`,
                  "ChatScreen",
                  {
                    result: resultData.result,
                  }
                );
              } catch (e) {
                Logger.logError(e, "ChatScreen.parseToolResult");
              }
            }
          }
        }
      }

      // Mark as complete
      Logger.logDebug(`Stream completed`, "ChatScreen", {
        finalText: accumulatedText.substring(0, 100),
        totalLength: accumulatedText.length,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      Logger.logError(error, "ChatScreen.handleSendMessage");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if API key is configured
  const hasApiKey = !!SECRETS.EXPO_PUBLIC_OPENAI_API_KEY;

  if (!hasApiKey) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background.primary },
        ]}
        edges={["top"]}
      >
        <ScreenHeader title="Chat" />
        <View style={[styles.errorContainer]}>
          <Text style={[styles.errorText, { color: theme.text.primary }]}>
            API Key Missing
          </Text>
          <Text style={[styles.errorSubtext, { color: theme.text.secondary }]}>
            Please add EXPO_PUBLIC_ANTHROPIC_API_KEY to your environment
            variables.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={["top"]}
    >
      <ScreenHeader
        title="Chat"
        OnRightElement={() => (
          <TouchableOpacity
            onPress={handleNewChat}
            disabled={isGenerating}
            style={[styles.newChatButton, { opacity: isGenerating ? 0.5 : 1 }]}
          >
            <Text style={[styles.newChatButtonText, { color: theme.ui.tint }]}>
              +
            </Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.contentContainer}>
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              Hello {user?.firstName || "there"}! Ask me anything about your
              time.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({ item }) => (
              <ChatMessage
                role={item.role}
                content={item.content}
                isLoading={item.isStreaming || false}
                toolName={item.toolName}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
        )}

        <ChatInput onSend={handleSendMessage} disabled={isGenerating} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  newChatButtonText: {
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 32,
  },
});
