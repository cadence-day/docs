import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import {
  useDialogStore,
  useSelectionStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useEffect } from "react";
import usePendingTimeslicesStore from "./usePendingTimeslicesStore";

/**
 * Hook that automatically creates timeslices when an activity is selected
 * and there are pending empty timeslices waiting for activity assignment
 */
export const useAutomaticTimesliceCreation = (opts?: {
  insertTimeslices?: (timeslices: Partial<any>[]) => Promise<any[]>;
  updateTimeslice?: (timeslice: any) => Promise<any>;
}) => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId
  );
  const pendingTimeslices = usePendingTimeslicesStore(
    (state) => state.pendingTimeslices
  );
  const pendingUpdates = usePendingTimeslicesStore(
    (state) => state.pendingUpdates
  );
  const clearPendingTimeslices = usePendingTimeslicesStore(
    (state) => state.clearPendingTimeslices
  );
  const clearPendingUpdates = usePendingTimeslicesStore(
    (state) => state.clearPendingUpdates
  );
  const insertTimeslicesInStore =
    opts?.insertTimeslices ??
    useTimeslicesStore((state) => state.insertTimeslices);
  const updateTimesliceInStore =
    opts?.updateTimeslice ??
    useTimeslicesStore((state) => state.updateTimeslice);
  const { showSuccess, showError } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    const processPendingTimeslices = async () => {
      // Process pending creations
      if (selectedActivityId && pendingTimeslices?.length > 0) {
        await createPendingTimeslices();
      }

      // Process pending updates
      if (selectedActivityId && pendingUpdates?.length > 0) {
        await updatePendingTimeslices();
      }
    };

    const createPendingTimeslices = async () => {
      try {
        // Convert pending timeslices to new timeslices with the selected activity
        const newTimeslices = pendingTimeslices.map((pendingTimeslice) => ({
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
          }
        );

        // Create all the timeslices (store/injected implementation may throw)
        let createdTimeslices: any[] | null = null;
        try {
          createdTimeslices = await insertTimeslicesInStore(newTimeslices);
        } catch (err) {
          GlobalErrorHandler.logError(
            err as Error,
            "AUTOMATIC_TIMESLICE_CREATION:INSERT",
            {
              activityId: selectedActivityId,
              pendingCount: pendingTimeslices.length,
            }
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
              { error: err }
            );
          }

          // Show success message
          const message =
            createdTimeslices.length === 1
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
            }
          );
        } else {
          GlobalErrorHandler.logError(
            new Error("No timeslices created"),
            "AUTOMATIC_TIMESLICE_CREATION",
            {
              pendingCount: pendingTimeslices.length,
              activityId: selectedActivityId,
            }
          );

          showError(t("failed-to-create-timeslices"));
        }
      } catch (error) {
        GlobalErrorHandler.logError(
          error as Error,
          "AUTOMATIC_TIMESLICE_CREATION",
          {
            pendingCount: pendingTimeslices?.length ?? 0,
            activityId: selectedActivityId,
          }
        );

        showError(t("failed-to-create-timeslices"));
      }
    };

    const updatePendingTimeslices = async () => {
      try {
        // Update existing timeslices with the selected activity
        GlobalErrorHandler.logDebug(
          "Updating timeslices from pending updates",
          "AUTOMATIC_TIMESLICE_UPDATE",
          {
            count: pendingUpdates.length,
            activityId: selectedActivityId,
            timeslices: pendingUpdates,
          }
        );

        let successCount = 0;
        const errors: any[] = [];

        // Update each timeslice individually
        for (const pendingUpdate of pendingUpdates) {
          try {
            const updatedTimeslice = {
              ...pendingUpdate,
              activity_id: selectedActivityId,
            };

            await updateTimesliceInStore(updatedTimeslice);
            successCount++;
          } catch (err) {
            errors.push({ timeslice: pendingUpdate, error: err });
            GlobalErrorHandler.logError(
              err as Error,
              "AUTOMATIC_TIMESLICE_UPDATE:SINGLE",
              {
                activityId: selectedActivityId,
                timeslice: pendingUpdate,
              }
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
              { error: err }
            );
          }

          // Show success message
          const message =
            successCount === 1
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
            }
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
            }
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
          }
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
            dialog.props?.isPickingMode === true
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
            { dialogId, processedCount }
          );
        }
      } catch (err) {
        GlobalErrorHandler.logWarning(
          "Failed to reset picking mode dialog",
          "AUTOMATIC_TIMESLICE_PROCESSING:RESET_PICKING_MODE",
          { error: err }
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
