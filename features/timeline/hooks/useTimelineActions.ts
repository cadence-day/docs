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
import { ActionSheetIOS, Alert, Platform } from "react-native";
import { hasNotesOrStates } from "../utils";
import usePendingTimeslicesStore from "./usePendingTimeslicesStore";
/**
 * Custom hook to handle timeline actions (create, update, delete timeslices)
 */
export const useTimelineActions = (opts?: {
  // Optional injected operations to decouple from stores (useful for tests)
  insertTimeslice?: (ts: Partial<Timeslice>) => Promise<Timeslice>;
  updateTimeslice?: (ts: Timeslice) => Promise<Timeslice>;
  deleteTimeslice?: (id: string) => Promise<void>;
  addPendingTimeslice?: (ts: Timeslice) => void;
  openDialog?: (dialog: React.ReactNode) => void;
  getDialogs?: () => Record<string, any>;
  bringToFront?: (id: string) => void;
  toggleCollapse?: (id: string) => void;
  closeDialog?: (id: string) => void;
}) => {
  const selectedActivityId = useSelectionStore(
    (state) => state.selectedActivityId,
  );

  // Store-backed operations: call hooks unconditionally and then allow
  // `opts` to override selected implementations. This preserves the
  // hook call order required by React rules-of-hooks while keeping the
  // ability to inject test doubles.
  const {
    insertTimeslice: _insertTimesliceFromStore,
    updateTimeslice: _updateTimesliceFromStore,
    deleteTimeslice: _deleteTimesliceFromStore,
  } = useTimeslicesStore((s) => ({
    insertTimeslice: s.insertTimeslice,
    updateTimeslice: s.updateTimeslice,
    deleteTimeslice: s.deleteTimeslice,
  }));

  const {
    toggleCollapse: _toggleCollapseFromStore,
    closeDialog: _closeDialogFromStore,
  } = useDialogStore((s) => ({
    toggleCollapse: s.toggleCollapse,
    closeDialog: s.closeDialog,
  }));

  // Pending timeslices operations
  const {
    addPendingTimeslice: _addPendingTimesliceFromStore,
    addPendingUpdate: _addPendingUpdateFromStore,
  } = usePendingTimeslicesStore((s) => ({
    addPendingTimeslice: s.addPendingTimeslice,
    addPendingUpdate: s.addPendingUpdate,
  }));

  // Expose final callables, allowing `opts` to override store implementations
  const insertTimesliceInStore = opts?.insertTimeslice ??
    _insertTimesliceFromStore;
  const updateTimesliceInStore = opts?.updateTimeslice ??
    _updateTimesliceFromStore;
  const deleteTimesliceInStore = opts?.deleteTimeslice ??
    _deleteTimesliceFromStore;
  // bringToFront support removed — it was declared but unused in this hook
  const toggleCollapse = opts?.toggleCollapse ?? _toggleCollapseFromStore;
  const closeDialog = opts?.closeDialog ?? _closeDialogFromStore;

  const addPendingTimeslice = opts?.addPendingTimeslice ??
    _addPendingTimesliceFromStore;
  const addPendingUpdate = _addPendingUpdateFromStore;

  const { t } = useI18n();
  const { showWarning } = useToast();
  const handleTimeslicePress = useCallback(
    async (timeslice: Timeslice) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const isEmpty = timeslice.id == null;

      // If no activity is selected, add timeslice to appropriate pending list and open activity dialog
      if (!selectedActivityId) {
        if (isEmpty) {
          // Add empty timeslices to pending creation list
          addPendingTimeslice(timeslice);
          GlobalErrorHandler.logDebug(
            "Added empty timeslice to pending list",
            "PENDING_TIMESLICE_ADDITION",
            { timeslice },
          );
        } else {
          // Add existing timeslices to pending update list
          addPendingUpdate(timeslice);
          GlobalErrorHandler.logDebug(
            "Added existing timeslice to pending updates list",
            "PENDING_TIMESLICE_UPDATE",
            { timeslice },
          );
        }

        // Resolve dialogs (opts.getDialogs may be provided for tests) and
        // enter picking mode
        const dialogs = opts?.getDialogs
          ? opts.getDialogs()
          : useDialogStore.getState().dialogs;

        // Find existing activity dialog
        const activityDialog = Object.values(dialogs).find(
          (dialog) => dialog.type === "activity-legend",
        );

        // First, collapse/close other dialogs to ensure only one container is expanded
        Object.entries(dialogs).forEach(([id, dialog]) => {
          if (dialog.type !== "activity") {
            try {
              if (dialog.props?.preventClose) {
                // Collapse other persistent dialogs
                if (!dialog.collapsed) {
                  toggleCollapse(id);
                }
                // Close non-persistent dialogs
                closeDialog(id);
              }
            } catch (err) {
              GlobalErrorHandler.logWarning(
                "Failed to adjust dialog during timeslice press",
                "TIMELINE_DIALOGS",
                { id, error: err },
              );
            }
          }
        });

        if (activityDialog) {
          // Expand the activity dialog if it's collapsed
          if (activityDialog.collapsed) {
            toggleCollapse(activityDialog.id);
          }

          // Set picking mode on the dialog so it updates its header
          try {
            useDialogStore.getState().setDialogProps(activityDialog.id, {
              isPickingMode: true,
            });
          } catch (err) {
            GlobalErrorHandler.logWarning(
              "setDialogProps failed",
              "TIMELINE_DIALOGS",
              { id: activityDialog.id, error: err },
            );
          }

          // Don't bring activity legend dialogs to front - they should stay in the background
          // Only expand them if collapsed
          try {
            if (activityDialog.collapsed) {
              toggleCollapse(activityDialog.id);
            }
          } catch (err) {
            GlobalErrorHandler.logWarning(
              "toggleCollapse failed",
              "TIMELINE_DIALOGS",
              { id: activityDialog.id, error: err },
            );
          }
        } else {
          const payload = {
            type: "activity-legend",
            props: {
              isPickingMode: true,
              preventClose: true,
            },
            position: "dock" as const,
          };

          if (opts?.openDialog) {
            opts.openDialog(payload as unknown as React.ReactNode);
          } else {
            useDialogStore.getState().openDialog(payload);
          }
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
            { newTimeslice },
          );
          const created = await insertTimesliceInStore(newTimeslice);
          if (!created) {
            GlobalErrorHandler.logError(
              new Error("Failed to create new timeslice"),
              "DYNAMIC_TIMESLICE_CREATION",
              { newTimeslice },
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
              { updatedTimeslice },
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
      addPendingUpdate,
      opts,
      toggleCollapse,
      closeDialog,
      t,
      showWarning,
    ],
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
          { start_time: timeslice.start_time },
        );
        return;
      }

      // Check if timeslice has notes or states attached
      const hasAttachments = hasNotesOrStates(timeslice);

      // Direct deletion handler
      const performDelete = async () => {
        try {
          await deleteTimesliceInStore(timeslice.id ?? "");
          GlobalErrorHandler.logDebug(
            "Timeslice deleted successfully",
            "DYNAMIC_TIMESLICE_DELETE",
            { timesliceId: timeslice.id },
          );
        } catch (error) {
          GlobalErrorHandler.logError(
            error as Error,
            "DYNAMIC_TIMESLICE_DELETE",
            { timesliceId: timeslice.id },
          );
        }
      };

      // If no attachments, delete directly
      if (!hasAttachments) {
        await performDelete();
        return;
      }

      // Show confirmation dialog for timeslices with notes or states
      const deleteMessage = t("delete-timeslice-with-data-warning");

      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: [t("cancel"), t("delete")],
            destructiveButtonIndex: 1,
            cancelButtonIndex: 0,
            message: deleteMessage,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              void performDelete();
            }
          },
        );
      } else {
        // Android fallback
        Alert.alert(t("confirm"), deleteMessage, [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("delete"),
            style: "destructive",
            onPress: () => void performDelete(),
          },
        ]);
      }
    },
    [deleteTimesliceInStore, t],
  );

  return {
    handleTimeslicePress,
    handleTimesliceLongPress,
  };
};
