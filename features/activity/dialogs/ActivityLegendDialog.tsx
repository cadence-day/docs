import Activities from "@/features/activity/Activities";
import { useI18n } from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import React, { useEffect } from "react";

type Props = {
  _dialogId?: string;
  isPickingMode?: boolean;
};

const ActivityLegendDialog: React.FC<Props> = ({
  _dialogId,
  isPickingMode,
}) => {
  const { t } = useI18n();

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

    useDialogStore.getState().setDialogProps(id, {
      headerProps: {
        title: isPickingMode
          ? t("pick-activity-first")
          : t("activity.legend.activities"),
        rightActionElement: t("edit"),
        onRightAction: openManage,
      },
      height: isPickingMode ? 50 : 28,
    });
  }, [_dialogId, isPickingMode, t]);

  return <Activities mode="view" gridConfig={{ columns: 4 }} />;
};

export default ActivityLegendDialog;
