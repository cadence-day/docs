import Activities from "@/features/activity/Activities";
import { useI18n } from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import React, { useCallback, useEffect } from "react";

type Props = {
  _dialogId?: string;
};

const ManageActivitiesDialog: React.FC<Props> = ({ _dialogId }) => {
  const { t } = useI18n();

  useEffect(() => {
    if (!_dialogId) return;
    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.legend.editActivities"),
      },
      height: 85,
    });
  }, [_dialogId, t]);

  const openCreate = useCallback(() => {
    useDialogStore.getState().openDialog({
      type: "activity-create",
      position: "center",
      props: {
        headerProps: { title: t("activity.legend.createActivity") },
        height: 85,
      },
    });
  }, [t]);

  const openEdit = useCallback((activity: any) => {
    useDialogStore.getState().openDialog({
      type: "activity-edit",
      position: "center",
      props: {
        activity,
        headerProps: { title: t("activity.legend.editActivity") },
        height: 85,
      },
    });
  }, [t]);

  return (
    <Activities
      mode="edit"
      gridConfig={{ columns: 4 }}
      onActivityPress={openEdit}
      onAddActivity={openCreate}
    />
  );
};

export default ManageActivitiesDialog;

