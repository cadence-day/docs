import { KeyboardShortcuts } from "@/shared/components/KeyboardShortcuts.web";
import { getDeviceType, webStyles } from "@/shared/utils/platform";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NoteDialogProps } from "../types";
import { NoteDialog as MobileNoteDialog } from "./NoteDialog";

// Web-enhanced version of NoteDialog with desktop features
export const NoteDialog: React.FC<NoteDialogProps> = (props) => {
  const deviceType = getDeviceType();
  const isDesktop = deviceType === "desktop-web";

  const handleNewNote = () => {
    // Add new note logic here
    console.log("New note shortcut triggered");
  };

  const handleSave = () => {
    // Save logic here
    console.log("Save shortcut triggered");
  };

  const handleSearch = () => {
    // Search logic here
    console.log("Search shortcut triggered");
  };

  return (
    <View style={[styles.container, isDesktop && styles.desktopContainer]}>
      {/* Render the mobile dialog */}
      <MobileNoteDialog {...props} />

      {/* Web-specific enhancements */}
      {isDesktop && (
        <>
          <KeyboardShortcuts
            onNewNote={handleNewNote}
            onSave={handleSave}
            onSearch={handleSearch}
          />

          {/* Desktop-specific toolbar */}
          <View style={styles.desktopToolbar}>
            <TouchableOpacity
              style={[styles.toolbarButton, webStyles.cursor("pointer")]}
              onPress={handleNewNote}
            >
              <Text style={styles.toolbarButtonText}>New Note</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toolbarButton, webStyles.cursor("pointer")]}
              onPress={handleSave}
            >
              <Text style={styles.toolbarButtonText}>Save All</Text>
            </TouchableOpacity>

            <View style={styles.toolbarSeparator} />

            <Text style={styles.toolbarInfo}>
              {props.timeslice?.activity_id
                ? "Activity Notes"
                : "General Notes"}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopContainer: {
    maxWidth: 800,
    alignSelf: "center",
    ...webStyles.boxShadow("0 4px 12px rgba(0, 0, 0, 0.15)"),
  },
  desktopToolbar: {
    position: "absolute",
    top: -50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    ...webStyles.boxShadow("0 -2px 4px rgba(0, 0, 0, 0.1)"),
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007bff",
    borderRadius: 4,
    marginRight: 10,
    ...webStyles.transition("background-color 0.2s"),
  },
  toolbarButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  toolbarSeparator: {
    width: 1,
    height: 20,
    backgroundColor: "#dee2e6",
    marginHorizontal: 10,
  },
  toolbarInfo: {
    fontSize: 12,
    color: "#6c757d",
    fontStyle: "italic",
  },
});
