import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface KeyboardShortcutsProps {
  onNewNote?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
}

// Web-specific component with keyboard shortcuts
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onNewNote,
  onSave,
  onSearch,
}) => {
  const [shortcuts, setShortcuts] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Cmd/Ctrl + N for new note
      if ((event.metaKey || event.ctrlKey) && event.key === "n") {
        event.preventDefault();
        onNewNote?.();
        setShortcuts((prev) => [...prev, "New Note"].slice(-3));
      }

      // Cmd/Ctrl + S for save
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        onSave?.();
        setShortcuts((prev) => [...prev, "Save"].slice(-3));
      }

      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onSearch?.();
        setShortcuts((prev) => [...prev, "Search"].slice(-3));
      }
    };

    // Only add event listener on web
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [onNewNote, onSave, onSearch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keyboard Shortcuts</Text>
      <View style={styles.shortcutList}>
        <Text style={styles.shortcut}>⌘+N - New Note</Text>
        <Text style={styles.shortcut}>⌘+S - Save</Text>
        <Text style={styles.shortcut}>⌘+K - Search</Text>
      </View>

      {shortcuts.length > 0 && (
        <View style={styles.recentShortcuts}>
          <Text style={styles.recentTitle}>Recent:</Text>
          {shortcuts.map((shortcut, index) => (
            <Text key={index} style={styles.recentItem}>
              {shortcut}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 15,
    borderRadius: 8,
    minWidth: 200,
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  shortcutList: {
    gap: 5,
  },
  shortcut: {
    color: "#ccc",
    fontSize: 12,
  },
  recentShortcuts: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#444",
  },
  recentTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
  recentItem: {
    color: "#90EE90",
    fontSize: 11,
  },
});
