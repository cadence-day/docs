import * as Haptics from "expo-haptics";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createEmptyNote } from "../utils";

import { ActivityBox } from "@/features/activity/components/ui/ActivityBox";
import { CdLevelIndicator } from "@/shared/components/CadenceUI";
import { useI18n } from "@/shared/hooks/useI18n";
import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import useNotesStore from "@/shared/stores/resources/useNotesStore";
import useStatesStore from "@/shared/stores/resources/useStatesStore";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

import { KeyboardToolbox, SwipeableNoteItem } from "../components";
import { useNoteHandlers } from "../hooks/useNoteHandlers";
import { styles } from "../styles";
import type { NoteDialogProps, NoteItem } from "../types";

export const NoteDialog: React.FC<NoteDialogProps> = ({
  timeslice,
  _dialogId,
}) => {
  const { t } = useI18n();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [deletedNoteIds, setDeletedNoteIds] = useState<string[]>([]);
  const [energy, setEnergy] = useState(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [pinnedNotes, setPinnedNotes] = useState<Set<number>>(new Set());

  const textInputRefs = useRef<(TextInput | null)[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const noteIds = useMemo(
    () => timeslice.note_ids?.map((id) => id.toString()) || [],
    [timeslice.note_ids]
  );
  const ts_id = timeslice.id?.toString();

  // Get stores
  const notesStore = useNotesStore();
  const statesStore = useStatesStore();
  const activitiesStore = useActivitiesStore();
  const dialogStore = useDialogStore();

  // Get the activity for this timeslice
  const noteActivity = activitiesStore.activities.find(
    (activity) => activity.id === timeslice.activity_id
  );

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (_dialogId) {
      dialogStore.closeDialog(_dialogId);
    }
  }, [_dialogId, dialogStore]);

  // Create handlers using the custom hook
  const noteHandlers = useNoteHandlers({
    notes,
    setNotes,
    deletedNoteIds,
    setDeletedNoteIds,
    energy,
    timeslice,
    noteIds,
    activeNoteIndex,
    setActiveNoteIndex,
    onClose: handleClose,
  });

  // Pin/unpin handlers
  const handlePinNote = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinnedNotes((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });

    // Update the note item
    setNotes((prev) =>
      prev.map((note, i) => (i === index ? { ...note, isPinned: true } : note))
    );
  }, []);

  const handleUnpinNote = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinnedNotes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });

    // Update the note item
    setNotes((prev) =>
      prev.map((note, i) => (i === index ? { ...note, isPinned: false } : note))
    );
  }, []);

  const loadEnergyState = useCallback(async () => {
    if (!ts_id) return;

    try {
      // Check if we have a state for this timeslice in local store
      const existingState = statesStore.states.find(
        (state) => state.timeslice_id === ts_id
      );

      if (existingState) {
        // Set energy from existing state (0 is a valid value)
        setEnergy(existingState.energy || 0);
      }
      // If no local state found, energy remains at default value of 0
    } catch (error) {
      GlobalErrorHandler.logError(error, "loadEnergyState", {
        timesliceId: ts_id,
      });
    }
  }, [ts_id]); // Remove statesStore.states dependency to prevent infinite re-renders

  const loadNotes = useCallback(async () => {
    if (!noteIds.length) {
      // No existing notes, add an empty one
      setNotes([
        {
          ...createEmptyNote(),
          timeslice_id: timeslice.id || null,
        } as NoteItem,
      ]);
      return;
    }

    try {
      setIsLoading(true);
      const loadedNotes = await notesStore.getNotes(noteIds);
      const noteItems: NoteItem[] = loadedNotes.filter(Boolean).map((note) => ({
        ...note,
        message: note.message || "",
        isNew: false,
        isPinned: false, // Default to false, can be enhanced later with database persistence
        isSaving: false,
        hasError: false,
      }));

      // Always ensure at least one note for input if we don't have any valid notes
      if (noteItems.length === 0) {
        noteItems.push(createEmptyNote());
      }

      setNotes(noteItems);
    } catch (error) {
      GlobalErrorHandler.logError(error, "loadNotes", {
        timesliceId: ts_id,
        noteIds,
      });
      setError("Failed to load notes. Please try again.");
      // Still show empty note for input
      setNotes([createEmptyNote()]);
    } finally {
      setIsLoading(false);
    }
  }, [noteIds, ts_id, timeslice.id]); // Removed notesStore - access it directly since it's stable

  // Load existing notes when dialog opens
  useEffect(() => {
    if (ts_id) {
      loadNotes();
      loadEnergyState();
    }
  }, [ts_id, loadNotes, loadEnergyState]);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleEnergyChange = useCallback(
    async (newValue: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const finalValue = newValue === energy ? 0 : newValue;
      setEnergy(finalValue);

      // Save energy to states store if we have a valid timeslice
      if (ts_id) {
        try {
          const stateData = {
            energy: finalValue || null, // Convert 0 to null for database
            mood: null, // Not managing mood in this dialog
            timeslice_id: ts_id,
            user_id: null, // Will be replaced by API with authenticated user's ID
          };

          await statesStore.upsertState(stateData);
        } catch (error) {
          GlobalErrorHandler.logError(error, "saveEnergyState", {
            timesliceId: ts_id,
            energy: finalValue,
          });
          // Don't show error to user for energy saves - it's not critical
        }
      }
    },
    [energy, ts_id, statesStore]
  );

  const handleNotePress = useCallback((index: number) => {
    setActiveNoteIndex(index);
    // Focus the text input
    setTimeout(() => {
      textInputRefs.current[index]?.focus();
    }, 100);
  }, []);

  const handleSaveNote = async (index: number) => {
    try {
      await noteHandlers.saveNote(index);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save note. Please try again.");
    }
  };

  const handleDeleteNote = (index: number) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          noteHandlers.deleteNote(index);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleSaveAll = useCallback(async () => {
    try {
      setIsLoading(true);
      await noteHandlers.saveAllNotes();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [noteHandlers.saveAllNotes, handleClose]);

  const hasAnyContent = useMemo(
    () =>
      notes.some((note) => (note.message?.trim().length ?? 0) > 0) ||
      energy > 0 ||
      deletedNoteIds.length > 0,
    [notes, energy, deletedNoteIds]
  );

  // Set initial dialog header props once when dialog mounts
  useEffect(() => {
    if (!_dialogId) return;

    // Set static header props once - no dynamic updates to prevent infinite loops
    dialogStore.setDialogProps(_dialogId, {
      headerProps: {
        title: noteActivity?.name ? `${noteActivity.name} Notes` : "Notes",
        titleButtonComponent: noteActivity ? (
          <ActivityBox
            activity={noteActivity}
            boxHeight={20}
            boxWidth={60}
            showTitle={false}
          />
        ) : null,
        rightActionElement: "Close",
        onRightAction: handleClose,
        titleFontSize: 18,
        rightActionFontSize: 14,
        headerAsButton: true,
        onHeaderPress: handleClose,
      },
      height: 85,
    });
  }, [_dialogId, noteActivity?.id, noteActivity?.name]); // Only when dialog ID or activity changes

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flex: 1 }}>
          <CdLevelIndicator
            label={t("energyLabel", "Energy")}
            value={energy}
            onChange={handleEnergyChange}
            props={{
              lowLabel: t("energyLow", "Low"),
              highLabel: t("energyHigh", "High"),
            }}
          />

          <ScrollView
            style={{ flex: 1, marginTop: 20 }}
            contentContainerStyle={{
              paddingBottom:
                keyboardVisible && activeNoteIndex !== null ? 100 : 20,
            }}
            scrollEnabled={true}
            scrollIndicatorInsets={{ right: 0, left: 0 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            ref={scrollViewRef}
          >
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading notes...</Text>
              </View>
            ) : notes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No notes yet. Add your first note below.
                </Text>
              </View>
            ) : (
              notes.map((note, index) => (
                <View key={index}>
                  {index > 0 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#444",
                        marginVertical: 15,
                        opacity: 0.5,
                      }}
                    />
                  )}

                  <SwipeableNoteItem
                    note={note}
                    index={index}
                    isActive={activeNoteIndex === index}
                    isPinned={pinnedNotes.has(index)}
                    placeholder={
                      note.isNew ? "Add a new note..." : "Edit your note..."
                    }
                    onChangeText={(text) =>
                      noteHandlers.updateNote(index, text)
                    }
                    onFocus={() => setActiveNoteIndex(index)}
                    onDelete={() => handleDeleteNote(index)}
                    onPin={() => handlePinNote(index)}
                    onUnpin={() => handleUnpinNote(index)}
                    textInputRef={{ current: textInputRefs.current[index] }}
                  />
                </View>
              ))
            )}

            <TouchableOpacity
              onPress={noteHandlers.addNote}
              style={{
                marginTop: 15,
                paddingVertical: 10,
                paddingHorizontal: 8,
                backgroundColor: "#333",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {t("add_new_note", "Add Note")}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Keyboard Toolbox */}
          <KeyboardToolbox
            visible={keyboardVisible && activeNoteIndex !== null}
            activeNoteIndex={activeNoteIndex}
            canSave={
              activeNoteIndex !== null &&
              (notes[activeNoteIndex]?.message?.trim().length ?? 0) > 0
            }
            canDelete={
              activeNoteIndex !== null && !notes[activeNoteIndex]?.isNew
            }
            isSaving={
              activeNoteIndex !== null &&
              (notes[activeNoteIndex]?.isSaving || false)
            }
            hasError={
              activeNoteIndex !== null &&
              (notes[activeNoteIndex]?.hasError || false)
            }
            onSave={async () => {
              if (activeNoteIndex !== null) {
                await handleSaveNote(activeNoteIndex);
              }
            }}
            onDelete={() => {
              if (activeNoteIndex !== null) {
                handleDeleteNote(activeNoteIndex);
              }
            }}
            onAddNote={noteHandlers.addNote}
            onClose={() => {
              setActiveNoteIndex(null);
              Keyboard.dismiss();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};
