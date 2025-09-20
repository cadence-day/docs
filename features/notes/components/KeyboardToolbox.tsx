import * as Haptics from "expo-haptics";
import { FloppyDisk, Plus, Trash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface KeyboardToolboxProps {
  visible: boolean;
  activeNoteIndex: number | null;
  canSave: boolean;
  canDelete: boolean;
  isSaving: boolean;
  hasError: boolean;
  onSave: () => void;
  onDelete: () => void;
  onAddNote: () => void;
  onClose: () => void;
}

export const KeyboardToolbox: React.FC<KeyboardToolboxProps> = ({
  visible,
  activeNoteIndex,
  canSave,
  canDelete,
  isSaving,
  hasError,
  onSave,
  onDelete,
  onAddNote,
  onClose,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  if (!visible) return null;

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  const handleAddNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddNote();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <View
      style={[
        styles.toolboxContainer,
        {
          bottom: keyboardHeight > 0 ? keyboardHeight : 0,
          width: screenWidth,
        },
      ]}
    >
      <View style={styles.toolboxContent}>
        {/* Left side - Status */}
        <View style={styles.statusSection}>
          {isSaving && (
            <View style={styles.statusItem}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.statusText}>Saving...</Text>
            </View>
          )}
          {hasError && (
            <View style={styles.statusItem}>
              <Text style={styles.errorText}>Failed to save</Text>
            </View>
          )}
          {activeNoteIndex !== null && !isSaving && !hasError && (
            <Text style={styles.statusText}>
              Editing note {activeNoteIndex + 1}
            </Text>
          )}
        </View>

        {/* Right side - Actions */}
        <View style={styles.actionsSection}>
          {/* Add Note Button */}
          <TouchableOpacity
            style={[styles.toolButton, styles.addButton]}
            onPress={handleAddNote}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.toolButton,
              styles.saveButton,
              !canSave && styles.toolButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!canSave || isSaving}
          >
            <FloppyDisk size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Delete Button */}
          {canDelete && (
            <TouchableOpacity
              style={[styles.toolButton, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isSaving}
            >
              <Trash size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Close/Done Button */}
          <TouchableOpacity
            style={[styles.toolButton, styles.doneButton]}
            onPress={handleClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = {
  toolboxContainer: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    ...(Platform.OS === "ios" && {
      paddingBottom: 34, // Account for iPhone home indicator when keyboard is visible
    }),
  },
  toolboxContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    minHeight: 52, // Ensure consistent height
  },
  statusSection: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingRight: 12,
  },
  statusItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statusText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginLeft: 6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  actionsSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12, // Increased gap for better spacing on full width
  },
  toolButton: {
    padding: 12, // Increased padding for better touch targets
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 48,
    minHeight: 48,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  addButton: {
    backgroundColor: "#6366F1",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  doneButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
};
