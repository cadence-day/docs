import { ActivityForm } from "@/features/activity/components/ui/ActivityForm";
import { useI18n } from "@/shared/hooks/useI18n";
import { useActivitiesStore, useDialogStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import React, { useEffect, useRef } from "react";

type Props = {
  _dialogId?: string;
};

const CreateActivityDialog: React.FC<Props> = ({ _dialogId }) => {
  const { t } = useI18n();
  const insertActivity = useActivitiesStore((s) => s.insertActivity);
  const formRef = useRef<{ submit: () => void }>(null);

  const handleBackToManage = React.useCallback(() => {
    if (_dialogId) {
      useDialogStore.getState().closeDialog(_dialogId);
    }
    // Open manage activities dialog
    useDialogStore.getState().openDialog({
      type: "activity-manage",
      position: "dock",
      props: {
        headerProps: { title: t("activity.legend.editActivities") },
        height: 85,
      },
    });
  }, [_dialogId, t]);

  useEffect(() => {
    if (!_dialogId) return;
    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.legend.createActivity"),
        leftActionElement: t("back"),
        onLeftAction: handleBackToManage,
        rightActionElement: t("save"),
        onRightAction: () => formRef.current?.submit(),
      },
      height: 85,
    });
  }, [_dialogId, t, handleBackToManage]);

  const handleSubmit = async (values: Partial<Activity>) => {
    const created = await insertActivity({
      ...(values as Omit<Activity, "id">),
      status: "ENABLED",
    });
    if (_dialogId && created) {
      useDialogStore.getState().closeDialog(_dialogId);
    }
  };

  return (
    <ActivityForm
      ref={formRef as any}
      _dialogId={_dialogId}
      onSubmit={handleSubmit}
      onCancel={() => {
        if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
      }}
    />
  );
};

export default CreateActivityDialog;
