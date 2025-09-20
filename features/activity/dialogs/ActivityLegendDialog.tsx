import Activities from "@/features/activity/components/Activities";
import { useI18n } from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import React, { useCallback, useEffect, useState } from "react";

type Props = {
  _dialogId?: string;
  isPickingMode?: boolean;
};

const ActivityLegendDialog: React.FC<Props> = ({
  _dialogId,
  isPickingMode: initialPickingMode,
}) => {
  const { t } = useI18n();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPickingMode, setIsPickingMode] = useState(
    initialPickingMode || false
  );

  const handleActivityLongPress = useCallback(() => {
    // Switch to edit mode when any activity is long pressed
    setIsEditMode(true);
  }, []);

  const handleExitEditMode = useCallback(() => {
    // Switch back to view mode
    setIsEditMode(false);
  }, []);

  const handleExitPickingMode = useCallback(() => {
    // Switch back to normal mode
    setIsPickingMode(false);
  }, []);

  // Update internal picking mode state when prop changes
  useEffect(() => {
    setIsPickingMode(initialPickingMode || false);
  }, [initialPickingMode]);

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
        rightActionElement: isEditMode
          ? undefined
          : isPickingMode
            ? t("common.done")
            : t("edit"),
        onRightAction: isEditMode
          ? undefined
          : isPickingMode
            ? handleExitPickingMode
            : openManage,
        leftActionElement: isEditMode ? t("common.done") : undefined,
        onLeftAction: isEditMode ? handleExitEditMode : undefined,
      },
      height: isPickingMode ? 50 : isEditMode ? 85 : 28,
    });
  }, [
    _dialogId,
    isPickingMode,
    isEditMode,
    t,
    handleExitEditMode,
    handleExitPickingMode,
  ]);

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
