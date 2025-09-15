import Activities from "@/features/activity/Activities";
import { useI18n } from "@/shared/hooks/useI18n";
import { useDialogStore, useSelectionStore } from "@/shared/stores";
import React, { useCallback, useEffect, useState } from "react";

type Props = {
  _dialogId?: string;
  isPickingMode?: boolean;
};

const ActivityLegendDialog: React.FC<Props> = ({
  _dialogId,
  isPickingMode,
}) => {
  const { t } = useI18n();
  const [isEditMode, setIsEditMode] = useState(false);

  const handleActivityLongPress = useCallback(() => {
    // Switch to edit mode when any activity is long pressed
    setIsEditMode(true);
  }, []);

  const handleExitEditMode = useCallback(() => {
    // Switch back to view mode
    setIsEditMode(false);
  }, []);

  const openEdit = useCallback(
    (activity: any) => {
      useDialogStore.getState().openDialog({
        type: "activity-edit",
        position: "dock",
        props: {
          activity,
          headerProps: { title: t("activity.legend.editActivity") },
          height: 85,
        },
      });
    },
    [t]
  );

  // If dialog was opened in picking mode, watch for selection changes. When an
  // activity is selected, exit picking mode and return to normal legend view.
  const selectedActivityId = useSelectionStore((s) => s.selectedActivityId);

  useEffect(() => {
    if (!_dialogId) return;
    if (!selectedActivityId) return;

    // If we were in picking mode, clear it and return to legend view
    try {
      useDialogStore.getState().setDialogProps(_dialogId, {
        isPickingMode: false,
      });
    } catch (err) {
      // ignore errors - best effort
    }

    // Ensure local edit state is cleared
    setIsEditMode(false);
  }, [_dialogId, selectedActivityId]);

  // Handle mode changes to update dialog properties
  useEffect(() => {
    if (!_dialogId) return;
    const id = _dialogId;

    const openManage = () => {
      useDialogStore.getState().openDialog({
        type: "activity-manage",
        position: "dock",
        props: {
          headerProps: { title: t("activity.legend.editActivities") },
          height: 85,
        },
      });
    };

    // Update dialog properties based on current mode
    useDialogStore.getState().setDialogProps(id, {
      headerProps: {
        title: isEditMode
          ? t("activity.legend.editActivities")
          : isPickingMode
            ? t("pick-activity-first")
            : t("activity.legend.activities"),
        // Do not show edit when in picking mode
        rightActionElement: isEditMode || isPickingMode ? undefined : t("edit"),
        onRightAction: isEditMode || isPickingMode ? undefined : openManage,
        leftActionElement: isEditMode ? t("common.done") : undefined,
        onLeftAction: isEditMode ? handleExitEditMode : undefined,
      },
      height: isPickingMode ? 50 : isEditMode ? 85 : 28,
    });
  }, [_dialogId, isPickingMode, isEditMode, t, handleExitEditMode]);

  return (
    <Activities
      key={isEditMode ? "edit" : "view"} // Force remount when mode changes
      mode={isEditMode ? "edit" : "view"}
      gridConfig={{ columns: 4 }}
      onActivityLongPress={handleActivityLongPress}
      onEditActivity={openEdit}
    />
  );
};

export default ActivityLegendDialog;
