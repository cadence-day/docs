import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import useDialogStore from "@/shared/stores/useDialogStore";
import type { Timeslice } from "@/shared/types/models";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NoteDialogProps {
  timeslice: Timeslice;
  _dialogId?: string;
}

const NoteDialog: React.FC<NoteDialogProps> = ({ timeslice, _dialogId }) => {
  const insertNote = useNotesStore((s) => s.insertNote);
  const upsertTimeslice = useTimeslicesStore((s) => s.upsertTimeslice);
  const insertState = useStatesStore((s) => s.insertState);

  const handleAddHello = async () => {
    if (!timeslice?.id) return;
    try {
      // Insert a fixed state (energy=3) and attach to timeslice
      try {
        const newState = await insertState({
          timeslice_id: timeslice.id,
          energy: 3,
          mood: null,
          user_id: null,
        } as any);

        if (newState && newState.id) {
          await upsertTimeslice({
            id: timeslice.id,
            state_id: newState.id,
          } as any);
        }
      } catch (stateErr) {
        console.warn(
          "Failed to insert state, continuing to insert note",
          stateErr
        );
      }

      const newNote = await insertNote({
        message: "Hello",
        timeslice_id: timeslice.id,
        user_id: null,
      } as any);

      if (newNote && newNote.id) {
        const updatedNoteIds = [...(timeslice.note_ids ?? []), newNote.id];
        await upsertTimeslice({
          id: timeslice.id,
          note_ids: updatedNoteIds,
        } as any);
      }
    } catch (e) {
      // If remote insert fails (API or permission), fallback to a local placeholder id
      console.warn(
        "Failed to add note remotely, falling back to local placeholder",
        e
      );
      const fallbackId = `local-note-${Date.now()}`;
      const updatedNoteIds = [...(timeslice.note_ids ?? []), fallbackId];
      try {
        await upsertTimeslice({
          id: timeslice.id,
          note_ids: updatedNoteIds,
        } as any);
      } catch (err) {
        console.warn("Failed to upsert timeslice with fallback note id", err);
      }
    } finally {
      // close dialog
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ marginBottom: 12 }}>Notes for timeslice</Text>
      <TouchableOpacity
        onPress={handleAddHello}
        style={{
          backgroundColor: "#6646EC",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          Add "Hello" note
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoteDialog;
