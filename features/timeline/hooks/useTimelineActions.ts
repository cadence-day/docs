// useTimelineActions.ts
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  useDialogStore,
  useSelectionStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
/**
 * Custom hook to handle timeline actions (create, update, delete timeslices)
 */
export const useTimelineActions = () => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId
  );

  // Store-backed operations
  const insertTimesliceInStore = useTimeslicesStore((s) => s.insertTimeslice);
  const updateTimesliceInStore = useTimeslicesStore((s) => s.updateTimeslice);
  const deleteTimesliceInStore = useTimeslicesStore((s) => s.deleteTimeslice);
  const openDialog = useDialogStore((s) => s.openDialog);
  const { t } = useI18n();
  const { showWarning } = useToast();
  const handleTimeslicePress = useCallback(
    async (timeslice: Timeslice) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // If no activity is selected, open the activity legend dialog and show toast
      if (!selectedActivityId) {
        // Open activity legend as a docked dialog
        openDialog({
          type: "activity-legend",
          props: { activityId: null },
          position: "dock",
        });
        // useI18n and useToast are called at hook top-level (see above)
        showWarning(t("select-activity"));
        return;
      }

      const isEmpty = timeslice.id == null;

      try {
        if (isEmpty) {
          // Create a new timeslice with UTC times
          const newTimeslice = {
            start_time: timeslice.start_time,
            end_time: timeslice.end_time,
            activity_id: selectedActivityId,
            state_id: timeslice.state_id,
            user_id: timeslice.user_id,
            note_ids: timeslice.note_ids,
          };
          GlobalErrorHandler.logDebug(
            "Creating new timeslice",
            "DYNAMIC_TIMESLICE_CREATION",
            { newTimeslice }
          );
          const created = await insertTimesliceInStore(newTimeslice);
          if (!created) {
            GlobalErrorHandler.logError(
              "Failed to create new timeslice",
              "DYNAMIC_TIMESLICE_CREATION",
              { newTimeslice }
            );
          }
        } else {
          // Update existing timeslice
          const updatedTimeslice: Timeslice = {
            ...timeslice,
            activity_id: selectedActivityId,
          };

          const updated = await updateTimesliceInStore(updatedTimeslice);
          if (!updated) {
            GlobalErrorHandler.logError(
              "Failed to update timeslice",
              "DYNAMIC_TIMESLICE_UPDATE",
              { updatedTimeslice }
            );
          }
        }
      } catch (error) {
        GlobalErrorHandler.logError(
          "Error handling timeslice press",
          "DYNAMIC_TIMESLICE_PRESS",
          { error }
        );
      }
    },
    [
      selectedActivityId,
      insertTimesliceInStore,
      updateTimesliceInStore,
      openDialog,
      t,
      showWarning,
    ]
  );

  const handleTimesliceLongPress = useCallback(
    async (timeslice: Timeslice) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const isEmpty = timeslice.id == null;

      if (isEmpty) {
        GlobalErrorHandler.logDebug(
          "Empty timeslice long pressed",
          "DYNAMIC_TIMESLICE_LONG_PRESS",
          { start_time: timeslice.start_time }
        );
        return;
      }

      try {
        await deleteTimesliceInStore(timeslice.id ?? "");
        GlobalErrorHandler.logDebug(
          "Timeslice deleted successfully",
          "DYNAMIC_TIMESLICE_DELETE",
          { timesliceId: timeslice.id }
        );
      } catch (error) {
        GlobalErrorHandler.logError(
          "Error deleting timeslice",
          "DYNAMIC_TIMESLICE_DELETE",
          { error }
        );
      }
    },
    [deleteTimesliceInStore]
  );

  return {
    handleTimeslicePress,
    handleTimesliceLongPress,
  };
};
