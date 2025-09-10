import { useToast } from "@/shared/hooks";
import { useI18n } from "@/shared/hooks/useI18n";
import { useSelectionStore, useTimeslicesStore } from "@/shared/stores";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useEffect } from "react";
import usePendingTimeslicesStore from "./usePendingTimeslicesStore";

/**
 * Hook that automatically creates timeslices when an activity is selected
 * and there are pending empty timeslices waiting for activity assignment
 */
export const useAutomaticTimesliceCreation = (opts?: {
  insertTimeslices?: (timeslices: Partial<any>[]) => Promise<any[]>;
}) => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId
  );
  const pendingTimeslices = usePendingTimeslicesStore(
    (state) => state.pendingTimeslices
  );
  const clearPendingTimeslices = usePendingTimeslicesStore(
    (state) => state.clearPendingTimeslices
  );
  const insertTimeslicesInStore =
    opts?.insertTimeslices ??
    useTimeslicesStore((state) => state.insertTimeslices);
  const { showSuccess, showError } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    const createPendingTimeslices = async () => {
      // Only proceed if we have both a selected activity and pending timeslices
      if (
        !selectedActivityId ||
        !pendingTimeslices ||
        pendingTimeslices.length === 0
      ) {
        return;
      }

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

    createPendingTimeslices();
  }, [
    selectedActivityId,
    pendingTimeslices.length, // Use length to trigger when items are added/removed
    clearPendingTimeslices,
    insertTimeslicesInStore,
    showSuccess,
    showError,
    t,
  ]);
};
