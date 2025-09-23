import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  useDialogStore,
  useSelectionStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useEffect } from "react";
import { Timeslice } from "../../../shared/types/models";
import usePendingTimeslicesStore from "./usePendingTimeslicesStore";

/**
 * Hook that automatically creates timeslices when an activity is selected
 * and there are pending empty timeslices waiting for activity assignment
 */
export const useAutomaticTimesliceCreation = (opts?: {
  insertTimeslices?: (timeslices: Partial<Timeslice>[]) => Promise<Timeslice[]>;
  updateTimeslice?: (timeslice: Timeslice) => Promise<Timeslice>;
}) => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId,
  );
  const pendingTimeslices = usePendingTimeslicesStore(
    (state) => state.pendingTimeslices,
  );
  const pendingUpdates = usePendingTimeslicesStore(
    (state) => state.pendingUpdates,
  );
  const clearPendingTimeslices = usePendingTimeslicesStore(
    (state) => state.clearPendingTimeslices,
  );
  const clearPendingUpdates = usePendingTimeslicesStore(
    (state) => state.clearPendingUpdates,
  );
  // Call hooks unconditionally and allow `opts` to override implementations
  const {
    insertTimeslices: _insertTimeslicesFromStore,
    updateTimeslice: _updateTimesliceFromStore,
  } = useTimeslicesStore((state) => ({
    insertTimeslices: state.insertTimeslices,
    updateTimeslice: state.updateTimeslice,
  }));

  const insertTimeslicesInStore = opts?.insertTimeslices ??
    _insertTimeslicesFromStore;
  const updateTimesliceInStore = opts?.updateTimeslice ??
    _updateTimesliceFromStore;
  const { showSuccess, showError } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    const processPendingTimeslices = async () => {
      // Read current pending lists from the store at execution time to avoid
      // closing over stale arrays in the effect's closure. We still keep the
      // length-based dependencies so the effect runs when items are added/removed.
      const currentPending =
        usePendingTimeslicesStore.getState().pendingTimeslices;
      const currentPendingUpdates =
        usePendingTimeslicesStore.getState().pendingUpdates;

      // Process pending creations
      if (selectedActivityId && currentPending?.length > 0) {
        await createPendingTimeslices();
      }

      // Process pending updates
      if (selectedActivityId && currentPendingUpdates?.length > 0) {
        await updatePendingTimeslices();
      }
    };

    const createPendingTimeslices = async () => {
      try {
        // Read current pending timeslices from store and convert to new timeslices
        const pending = usePendingTimeslicesStore.getState().pendingTimeslices;
        const newTimeslices = pending.map((pendingTimeslice) => ({
          start_time: pendingTimeslice.start_time,
          end_time: pendingTimeslice.end_time,
          activity_id: selectedActivityId,
          state_id: pendingTimeslice.state_id,
          user_id: pendingTimeslice.user_id,
          note_ids: pendingTimeslice.note_ids,
        }));

        GlobalErrorHandler.logDebug(
          "Creating timeslices from pending selections",
          "AUTOMATIC_TIMESLICE_CREATION",
          {
            count: newTimeslices.length,
            activityId: selectedActivityId,
            timeslices: newTimeslices,
          },
        );

        // Create all the timeslices (store/injected implementation may throw)
        let createdTimeslices: Timeslice[] | null = null;
        try {
          createdTimeslices = await insertTimeslicesInStore(newTimeslices);
        } catch (err) {
          GlobalErrorHandler.logError(
            err as Error,
            "AUTOMATIC_TIMESLICE_CREATION:INSERT",
            {
              activityId: selectedActivityId,
              pendingCount: pending.length,
            },
          );
        }

        if (createdTimeslices && createdTimeslices.length > 0) {
          // Clear pending timeslices since they've been created
          try {
            clearPendingTimeslices();
          } catch (err) {
            GlobalErrorHandler.logWarning(
              "Failed to clear pending timeslices",
              "AUTOMATIC_TIMESLICE_CREATION:CLEAR_PENDING",
              { error: err },
            );
          }

          // Show success message
          const message = createdTimeslices.length === 1
            ? t("timeslice-created-successfully")
            : t("timeslices-created-successfully", {
              count: createdTimeslices.length,
            });

          showSuccess(message);

          await resetPickingModeDialog(createdTimeslices.length);

          GlobalErrorHandler.logDebug(
            "Successfully created timeslices from pending selections",
            "AUTOMATIC_TIMESLICE_CREATION",
            {
              createdCount: createdTimeslices.length,
              activityId: selectedActivityId,
            },
          );
        } else {
          GlobalErrorHandler.logError(
            new Error("No timeslices created"),
            "AUTOMATIC_TIMESLICE_CREATION",
            {
              pendingCount: pending.length,
              activityId: selectedActivityId,
            },
          );

          showError(t("failed-to-create-timeslices"));
        }
      } catch (error) {
        GlobalErrorHandler.logError(
          error as Error,
          "AUTOMATIC_TIMESLICE_CREATION",
          {
            pendingCount: pending?.length ?? 0,
            activityId: selectedActivityId,
          },
        );

        showError(t("failed-to-create-timeslices"));
      }
    };

    const updatePendingTimeslices = async () => {
      try {
        // Update existing timeslices with the selected activity
        // Read current pending updates for logging and processing
        const updates = usePendingTimeslicesStore.getState().pendingUpdates;
        GlobalErrorHandler.logDebug(
          "Updating timeslices from pending updates",
          "AUTOMATIC_TIMESLICE_UPDATE",
          {
            count: updates.length,
            activityId: selectedActivityId,
            timeslices: updates,
          },
        );

        let successCount = 0;
        const errors: { timeslice: Timeslice; error: Error }[] = [];

        // Update each timeslice individually
        for (const pendingUpdate of updates) {
          try {
            const updatedTimeslice = {
              ...pendingUpdate,
              activity_id: selectedActivityId,
            };

            await updateTimesliceInStore(updatedTimeslice);
            successCount++;
          } catch (err) {
            errors.push({ timeslice: pendingUpdate, error: err as Error });
            GlobalErrorHandler.logError(
              err as Error,
              "AUTOMATIC_TIMESLICE_UPDATE:SINGLE",
              {
                activityId: selectedActivityId,
                timeslice: pendingUpdate,
              },
            );
          }
        }

        if (successCount > 0) {
          // Clear pending updates since they've been processed
          try {
            clearPendingUpdates();
          } catch (err) {
            GlobalErrorHandler.logWarning(
              "Failed to clear pending updates",
              "AUTOMATIC_TIMESLICE_UPDATE:CLEAR_PENDING",
              { error: err },
            );
          }

          // Show success message
          const message = successCount === 1
            ? t("timeslice-updated-successfully")
            : t("timeslices-updated-successfully", {
              count: successCount,
            });

          showSuccess(message);

          await resetPickingModeDialog(successCount);

          GlobalErrorHandler.logDebug(
            "Successfully updated timeslices from pending updates",
            "AUTOMATIC_TIMESLICE_UPDATE",
            {
              updatedCount: successCount,
              activityId: selectedActivityId,
            },
          );
        }

        if (errors.length > 0) {
          GlobalErrorHandler.logError(
            new Error(`Failed to update ${errors.length} timeslices`),
            "AUTOMATIC_TIMESLICE_UPDATE",
            {
              errorCount: errors.length,
              activityId: selectedActivityId,
              errors,
            },
          );

          showError(t("failed-to-update-some-timeslices"));
        }
      } catch (error) {
        GlobalErrorHandler.logError(
          error as Error,
          "AUTOMATIC_TIMESLICE_UPDATE",
          {
            pendingCount: pendingUpdates?.length ?? 0,
            activityId: selectedActivityId,
          },
        );

        showError(t("failed-to-update-timeslices"));
      }
    };

    const resetPickingModeDialog = async (processedCount: number) => {
      // Reset picking mode on the activity legend dialog instead of closing it
      try {
        const dialogs = useDialogStore.getState().dialogs;
        const pickingDialog = Object.entries(dialogs).find(
          ([_, dialog]) =>
            dialog.type === "activity-legend" &&
            dialog.props?.isPickingMode === true,
        );

        if (pickingDialog) {
          const [dialogId] = pickingDialog;
          // Reset picking mode to exit picking state and return to normal activity legend
          useDialogStore.getState().setDialogProps(dialogId, {
            isPickingMode: false,
          });

          GlobalErrorHandler.logDebug(
            "Reset picking mode dialog after successful timeslice processing",
            "AUTOMATIC_TIMESLICE_PROCESSING:RESET_PICKING_MODE",
            { dialogId, processedCount },
          );
        }
      } catch (err) {
        GlobalErrorHandler.logWarning(
          "Failed to reset picking mode dialog",
          "AUTOMATIC_TIMESLICE_PROCESSING:RESET_PICKING_MODE",
          { error: err },
        );
      }
    };

    processPendingTimeslices();
  }, [
    selectedActivityId,
    pendingTimeslices.length, // Use length to trigger when items are added/removed
    pendingUpdates.length, // Use length to trigger when items are added/removed
    clearPendingTimeslices,
    clearPendingUpdates,
    insertTimeslicesInStore,
    updateTimesliceInStore,
    showSuccess,
    showError,
    t,
  ]);
};
