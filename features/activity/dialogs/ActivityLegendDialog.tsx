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
          height: 100,
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
          height: 100,
        },
      });
    };

    // Update dialog properties based on current mode
    let title: string;
    if (isEditMode) {
      title = t("activity.legend.editActivities");
    } else if (isPickingMode) {
      title = t("pick-activity-first");
    } else {
      title = t("activity.legend.activities");
    }

    let rightActionElement: string | undefined;
    if (isEditMode) {
      rightActionElement = undefined;
    } else if (isPickingMode) {
      rightActionElement = t("common.done");
    } else {
      rightActionElement = t("edit");
    }

    let onRightAction: (() => void) | undefined;
    if (isEditMode) {
      onRightAction = undefined;
    } else if (isPickingMode) {
      onRightAction = handleExitPickingMode;
    } else {
      onRightAction = openManage;
    }

    const leftActionElement = isEditMode ? t("common.done") : undefined;
    const onLeftAction = isEditMode ? handleExitEditMode : undefined;

    let height = 35; // TODO: Default height should be different depending on the number of activities available, if less than 4, between 4 and 8, or more than 8. If less than 4, show one row, if between 4 and 8, show two rows, otherwise show 2 rows and the preview of the third row. (heights are respectively 22, 33, 35)
    if (isPickingMode) height = 50;
    else if (isEditMode) height = 100;

    useDialogStore.getState().setDialogProps(id, {
      headerProps: {
        title,
        // Do not show edit when in picking mode
        rightActionElement,
        onRightAction,
        leftActionElement,
        onLeftAction,
      },
      height,
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
