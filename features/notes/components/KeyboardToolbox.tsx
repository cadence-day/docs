import * as Haptics from "expo-haptics";
import { FloppyDisk, Plus, Trash } from "phosphor-react-native";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
    <View style={styles.toolboxContainer}>
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...(Platform.OS === "ios" && {
      paddingBottom: 34, // Account for iPhone home indicator
    }),
  },
  toolboxContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  statusSection: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    gap: 8,
  },
  toolButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 44,
    minHeight: 44,
    alignItems: "center" as const,
    justifyContent: "center" as const,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
  },
};
