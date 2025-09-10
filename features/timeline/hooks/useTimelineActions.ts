// useTimelineActions.ts
import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  useDialogStore,
  usePendingTimeslicesStore,
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
export const useTimelineActions = (opts?: {
  // Optional injected operations to decouple from stores (useful for tests)
  insertTimeslice?: (ts: Partial<Timeslice>) => Promise<any>;
  updateTimeslice?: (ts: Timeslice) => Promise<any>;
  deleteTimeslice?: (id: string) => Promise<void>;
  addPendingTimeslice?: (ts: Timeslice) => void;
  openDialog?: (dialog: any) => void;
  getDialogs?: () => Record<string, any>;
  bringToFront?: (id: string) => void;
  toggleCollapse?: (id: string) => void;
  closeDialog?: (id: string) => void;
}) => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId
  );

  // Store-backed operations
  const insertTimesliceInStore =
    opts?.insertTimeslice ?? useTimeslicesStore((s) => s.insertTimeslice);
  const updateTimesliceInStore =
    opts?.updateTimeslice ?? useTimeslicesStore((s) => s.updateTimeslice);
  const deleteTimesliceInStore =
    opts?.deleteTimeslice ?? useTimeslicesStore((s) => s.deleteTimeslice);
  const openDialog = opts?.openDialog ?? useDialogStore((s) => s.openDialog);
  const getDialogs =
    opts?.getDialogs ?? (() => useDialogStore.getState().dialogs);
  const bringToFront =
    opts?.bringToFront ?? useDialogStore((s) => s.bringToFront);
  const toggleCollapse =
    opts?.toggleCollapse ?? useDialogStore((s) => s.toggleCollapse);
  const closeDialog = opts?.closeDialog ?? useDialogStore((s) => s.closeDialog);

  // Pending timeslices operations
  const addPendingTimeslice =
    opts?.addPendingTimeslice ??
    usePendingTimeslicesStore((s) => s.addPendingTimeslice);

  const { t } = useI18n();
  const { showWarning } = useToast();
  const handleTimeslicePress = useCallback(
    async (timeslice: Timeslice) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const isEmpty = timeslice.id == null;

      // If no activity is selected, add empty timeslice to pending and open activity dialog
      if (!selectedActivityId) {
        // Only add empty timeslices to pending list
        if (isEmpty) {
          addPendingTimeslice(timeslice);
          GlobalErrorHandler.logDebug(
            "Added empty timeslice to pending list",
            "PENDING_TIMESLICE_ADDITION",
            { timeslice }
          );
        }

        // Find existing activity dialog and enter picking mode
        const activityDialog = Object.values(getDialogs()).find(
          (dialog) => dialog.type === "activity"
        );

        // First, collapse/close other dialogs to ensure only one container is expanded
        Object.entries(getDialogs()).forEach(([id, dialog]) => {
          if (dialog.type !== "activity") {
            try {
              if (dialog.props?.preventClose) {
                // Collapse other persistent dialogs
                if (!dialog.collapsed) {
                  toggleCollapse(id);
                }
              } else {
                // Close non-persistent dialogs
                closeDialog(id);
              }
            } catch (err) {
              GlobalErrorHandler.logWarning(
                "Failed to adjust dialog during timeslice press",
                "TIMELINE_DIALOGS",
                { id, error: err }
              );
            }
          }
        });

        if (activityDialog) {
          // Expand the activity dialog if it's collapsed
          if (activityDialog.collapsed) {
            toggleCollapse(activityDialog.id);
          }

          // Call the enterPickingMode function if it exists
          const props = activityDialog.props;
          if (props && typeof props.enterPickingMode === "function") {
            try {
              props.enterPickingMode();
            } catch (err) {
              GlobalErrorHandler.logWarning(
                "enterPickingMode threw",
                "TIMELINE_DIALOGS",
                { error: err }
              );
            }
          }

          // Bring the dialog to front
          try {
            bringToFront(activityDialog.id);
          } catch (err) {
            GlobalErrorHandler.logWarning(
              "bringToFront failed",
              "TIMELINE_DIALOGS",
              { id: activityDialog.id, error: err }
            );
          }
        } else {
          // Fallback: open new dialog if none exists
          openDialog({
            type: "activity",
            props: {
              mode: "legend",
              isPickingMode: true,
              preventClose: true,
            },
            position: "dock",
          });
        }

        // Show warning message
        showWarning(t("select-activity"));
        return;
      }

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
              new Error("Failed to create new timeslice"),
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
              new Error("Failed to update timeslice"),
              "DYNAMIC_TIMESLICE_UPDATE",
              { updatedTimeslice }
            );
          }
        }
      } catch (error) {
        GlobalErrorHandler.logError(error as Error, "DYNAMIC_TIMESLICE_PRESS", {
          timeslice,
        });
      }
    },
    [
      selectedActivityId,
      insertTimesliceInStore,
      updateTimesliceInStore,
      addPendingTimeslice,
      openDialog,
      getDialogs,
      bringToFront,
      toggleCollapse,
      closeDialog,
      t,
      showWarning,
    ]
  );

  const handleTimesliceLongPress = useCallback(
    async (timeslice: Timeslice) => {
      // Enhanced haptic feedback for deletion - use Heavy for more impact
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
          error as Error,
          "DYNAMIC_TIMESLICE_DELETE",
          { timesliceId: timeslice.id }
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
