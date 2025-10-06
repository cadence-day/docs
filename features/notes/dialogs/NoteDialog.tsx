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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createEmptyNote } from "../utils";

import { ActivityBox } from "@/features/activity/components/ui/ActivityBox";
import { CdMoodSelector } from "@/shared/components/CadenceUI";
import { useI18n } from "@/shared/hooks/useI18n";

import {
  useActivitiesStore,
  useDialogStore,
  useNotesStore,
  useStatesStore,
} from "@/shared/stores";

import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

import { useToast } from "../../../shared/hooks";
import { SwipeableNoteItem } from "../components";
import { useNoteHandlers } from "../hooks/useNoteHandlers";
import { styles } from "../styles";
import type { NoteDialogProps, NoteItem } from "../types";

export const NoteDialog: React.FC<NoteDialogProps> = ({
  timeslice,
  _dialogId,
}) => {
  const { t } = useI18n();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [energy, setEnergy] = useState(0);
  const [mood, setMood] = useState(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [pinnedNotes, setPinnedNotes] = useState<Set<number>>(new Set());
  const { showError } = useToast();

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
  const { setDialogProps, closeDialog } = useDialogStore();

  // Get the activity for this timeslice
  const noteActivity = activitiesStore.activities.find(
    (activity) => activity.id === timeslice.activity_id
  );

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (_dialogId) {
      closeDialog(_dialogId);
    }
  }, [_dialogId, closeDialog]);

  // Create handlers using the custom hook
  const noteHandlers = useNoteHandlers({
    notes,
    setNotes,
    energy,
    mood,
    timeslice,
    noteIds,
    activeNoteIndex,
    setActiveNoteIndex,
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

  const loadStateData = useCallback(async () => {
    if (!ts_id) return;

    try {
      // First check if we have a state for this timeslice in local store
      let existingState = statesStore.states.find(
        (state) => state.timeslice_id === ts_id
      );

      // If not found locally, try to fetch from database
      if (!existingState) {
        const fetchedState = await statesStore.getStateByTimeslice(ts_id);
        if (fetchedState) {
          existingState = fetchedState;
        }
      }

      if (existingState) {
        // Set energy and mood from existing state (0 is a valid value)
        setEnergy(existingState.energy || 0);
        setMood(existingState.mood || 0);
      }
      // If no state found anywhere, energy and mood remain at default value of 0
    } catch (error) {
      GlobalErrorHandler.logError(error, "loadStateData", {
        timesliceId: ts_id,
      });
    }
  }, [ts_id, statesStore]); // Add statesStore back since we use getStateByTimeslice

  const loadNotes = useCallback(async () => {
    if (!noteIds.length) {
      // No existing notes, add an empty one with proper timeslice_id
      const emptyNote = {
        ...createEmptyNote(),
        timeslice_id: timeslice.id || null,
      };
      setNotes([emptyNote]);
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
        const emptyNote = {
          ...createEmptyNote(),
          timeslice_id: timeslice.id || null,
        };
        noteItems.push(emptyNote);
      }

      setNotes(noteItems);
    } catch (error) {
      GlobalErrorHandler.logError(error, "loadNotes", {
        timesliceId: ts_id,
        noteIds,
      });
      setError("Failed to load notes. Please try again.");
      // Still show empty note for input
      const emptyNote = {
        ...createEmptyNote(),
        timeslice_id: timeslice.id || null,
      };
      setNotes([emptyNote]);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteIds, ts_id, timeslice.id]); // Remove notesStore dependency to prevent re-renders

  // Load existing notes when dialog opens
  useEffect(() => {
    if (ts_id) {
      loadNotes();
      loadStateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ts_id]); // Only depend on ts_id to prevent infinite loops

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Ensure textInputRefs array has the correct length
  useEffect(() => {
    const currentLength = textInputRefs.current.length;
    const requiredLength = notes.length;

    if (currentLength < requiredLength) {
      // Extend the array with null values
      textInputRefs.current = [
        ...textInputRefs.current,
        ...Array(requiredLength - currentLength).fill(null),
      ];
    } else if (currentLength > requiredLength) {
      // Truncate the array
      textInputRefs.current = textInputRefs.current.slice(0, requiredLength);
    }
  }, [notes.length]);

  //? Deprecated - energy is not currently used - keep it eventually for future use.
  // const handleEnergyChange = useCallback(
  //   async (newValue: number) => {
  //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  //     const finalValue = newValue === energy ? 0 : newValue;
  //     setEnergy(finalValue);

  //     // Save energy to states store if we have a valid timeslice
  //     if (ts_id) {
  //       try {
  //         // First check if we have a state for this timeslice in local store
  //         let existingState = statesStore.states.find(
  //           (state) => state.timeslice_id === ts_id
  //         );

  //         // If not found locally, try to fetch from database
  //         if (!existingState) {
  //           try {
  //             const fetchedState = await statesStore.getStateByTimeslice(ts_id);
  //             if (fetchedState) {
  //               existingState = fetchedState;
  //             }
  //           } catch (fetchError) {
  //             // If fetch fails, we'll create a new state below
  //             GlobalErrorHandler.logError(
  //               fetchError,
  //               "handleEnergyChange_fetchState",
  //               {
  //                 timesliceId: ts_id,
  //               }
  //             );
  //           }
  //         }

  //         const stateData = existingState
  //           ? {
  //               ...existingState,
  //               energy: finalValue || null, // Convert 0 to null for database
  //             }
  //           : {
  //               energy: finalValue || null, // Convert 0 to null for database
  //               mood: mood || null, // Preserve current mood value
  //               timeslice_id: ts_id,
  //               user_id: null, // Will be replaced by API with authenticated user's ID
  //             };

  //         await statesStore.upsertState(stateData);
  //       } catch (error) {
  //         GlobalErrorHandler.logError(error, "saveEnergyState", {
  //           timesliceId: ts_id,
  //           energy: finalValue,
  //         });
  //         // Don't show error to user for energy saves - it's not critical
  //       }
  //     }
  //   },
  //   [energy, mood, ts_id, statesStore]
  // );

  const handleMoodChange = useCallback(
    async (newValue: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const finalValue = newValue === mood ? 0 : newValue;
      setMood(finalValue);

      // Save mood to states store if we have a valid timeslice
      if (ts_id) {
        try {
          // First check if we have a state for this timeslice in local store
          let existingState = statesStore.states.find(
            (state) => state.timeslice_id === ts_id
          );

          // If not found locally, try to fetch from database
          if (!existingState) {
            try {
              const fetchedState = await statesStore.getStateByTimeslice(ts_id);
              if (fetchedState) {
                existingState = fetchedState;
              }
            } catch (fetchError) {
              // If fetch fails, we'll create a new state below
              GlobalErrorHandler.logError(
                fetchError,
                "handleMoodChange_fetchState",
                {
                  timesliceId: ts_id,
                }
              );
            }
          }

          const stateData = existingState
            ? {
                ...existingState,
                mood: finalValue || null, // Convert 0 to null for database
              }
            : {
                energy: energy || null, // Preserve current energy value
                mood: finalValue || null, // Convert 0 to null for database
                timeslice_id: ts_id,
                user_id: null, // Will be replaced by API with authenticated user's ID
              };

          await statesStore.upsertState(stateData);
        } catch (error) {
          GlobalErrorHandler.logError(error, "saveMoodState", {
            timesliceId: ts_id,
            mood: finalValue,
          });
          // Don't show error to user for mood saves - it's not critical
        }
      }
    },
    [energy, mood, ts_id, statesStore]
  );

  const handleSaveNote = async (index: number) => {
    try {
      await noteHandlers.saveNote(index);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      GlobalErrorHandler.logError(error, "handleSaveNote", { index });
      showError("Failed to save note. Please try again.");
    }
  };

  const handleDeleteNote = (index: number) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Update pinnedNotes set to account for shifted indices BEFORE deletion
            setPinnedNotes((prev) => {
              const newSet = new Set<number>();
              prev.forEach((pinnedIndex) => {
                if (pinnedIndex < index) {
                  // Notes before the deleted note keep the same index
                  newSet.add(pinnedIndex);
                } else if (pinnedIndex > index) {
                  // Notes after the deleted note shift down by 1
                  newSet.add(pinnedIndex - 1);
                }
                // The deleted note (pinnedIndex === index) is not added back
              });
              return newSet;
            });

            // Update textInputRefs array to remove the deleted note's ref BEFORE deletion
            textInputRefs.current = textInputRefs.current.filter(
              (_, i) => i !== index
            );

            // Then handle the note deletion
            await noteHandlers.deleteNote(index);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            GlobalErrorHandler.logError(error, "handleDeleteNote", { index });
            showError("Failed to delete note. Please try again.");
          }
        },
      },
    ]);
  };

  // Set initial dialog header props once when dialog mounts
  useEffect(() => {
    if (!_dialogId) return;

    // Set static header props once - no dynamic updates to prevent infinite loops
    setDialogProps(_dialogId, {
      headerProps: {
        title: noteActivity?.name ? `${noteActivity.name} Notes` : "Notes",
        titleButtonComponent: noteActivity ? (
          <ActivityBox
            activity={noteActivity}
            boxHeight={20}
            boxWidth={60}
            showTitle={false}
            showHighlight={false}
            marginBottom={-2}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_dialogId, noteActivity?.name, noteActivity?.id]); // Only when dialog ID or activity changes

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* <CdLevelIndicator
          label={t("energyLabel")}
          value={energy}
          onChange={handleEnergyChange}
          props={{
            lowLabel: t("energyLow"),
            highLabel: t("energyHigh"),
          }}
        /> */}

        <CdMoodSelector
          label="MOOD"
          value={mood}
          onChange={handleMoodChange}
          style={styles.moodSelectorWithMargin}
        />

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={
            keyboardVisible && activeNoteIndex !== null
              ? styles.scrollContentContainerKeyboard
              : styles.scrollContentContainer
          }
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

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Loading notes...</Text>
            </View>
          )}
          {!isLoading && notes.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No notes yet. Add your first note below.
              </Text>
            </View>
          )}
          {!isLoading &&
            notes.length > 0 &&
            notes.map((note, index) => {
              const canSave = (note.message?.trim().length || 0) > 0;
              const isSaving = note.isSaving || false;

              return (
                <View key={index}>
                  <SwipeableNoteItem
                    note={note}
                    index={index}
                    isActive={activeNoteIndex === index}
                    isPinned={pinnedNotes.has(index)}
                    canSave={canSave}
                    isSaving={isSaving}
                    placeholder={
                      note.isNew ? t("add-a-new-note") : t("edit-your-note")
                    }
                    onChangeText={(text) => {
                      noteHandlers.updateNote(index, text);
                    }}
                    onFocus={() => {
                      setActiveNoteIndex(index);
                    }}
                    onSave={() => handleSaveNote(index)}
                    onDelete={() => handleDeleteNote(index)}
                    onPin={() => handlePinNote(index)}
                    onUnpin={() => handleUnpinNote(index)}
                    textInputRef={{
                      get current() {
                        return textInputRefs.current[index] || null;
                      },
                      set current(value) {
                        if (textInputRefs.current.length <= index) {
                          // Extend array if needed
                          textInputRefs.current = [
                            ...textInputRefs.current,
                            ...Array(
                              index + 1 - textInputRefs.current.length
                            ).fill(null),
                          ];
                        }
                        textInputRefs.current[index] = value;
                      },
                    }}
                  />
                </View>
              );
            })}

          <TouchableOpacity
            onPress={noteHandlers.addNote}
            style={styles.addNewNoteButton}
          >
            <Text style={styles.addNewNoteButtonText}>{t("add-new-note")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};
