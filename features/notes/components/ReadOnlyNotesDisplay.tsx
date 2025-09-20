import { Star } from "phosphor-react-native";
import React from "react";
import { Text, View } from "react-native";

import type { NoteItem } from "../types";

interface ReadOnlyNotesDisplayProps {
  notes: NoteItem[];
  showPinIndicator?: boolean;
}

interface ReadOnlyNoteItemProps {
  note: NoteItem;
  showPinIndicator?: boolean;
}

const ReadOnlyNoteItem: React.FC<ReadOnlyNoteItemProps> = ({
  note,
  showPinIndicator = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.noteContainer, note.isPinned && styles.pinnedNote]}>
        <Text style={styles.noteInput}>{note.message || ""}</Text>

        {note.isPinned && showPinIndicator && (
          <View style={styles.pinIndicator}>
            <Star size={16} color="#6366F1" />
          </View>
        )}
      </View>
    </View>
  );
};

export const ReadOnlyNotesDisplay: React.FC<ReadOnlyNotesDisplayProps> = ({
  notes,
  showPinIndicator = true,
}) => {
  return (
    <View>
      {notes.map((note, index) => (
        <ReadOnlyNoteItem
          key={note.id || `note-${index}`}
          note={note}
          showPinIndicator={showPinIndicator}
        />
      ))}
    </View>
  );
};

const styles = {
  container: {
    position: "relative" as const,
    marginBottom: 12,
  },
  noteContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    minHeight: 60,
    position: "relative" as const,
  },
  pinnedNote: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  noteInput: {
    color: "#FFFFFF",
    fontSize: 16,
    padding: 16,
    paddingRight: 16,
    minHeight: 60,
    textAlignVertical: "top" as const,
  },
  pinIndicator: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
