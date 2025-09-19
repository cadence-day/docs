import { ActivityBox } from "@/features/activity/components/ui/ActivityBox";
import { useI18n } from "@/shared/hooks/useI18n";
import { useDialogStore } from "@/shared/stores";
import React, { useEffect } from "react";
import { View } from "react-native";
import ReflectionTimesliceInfo from "../components/ReflectionTimesliceInfo";
import type { EnhancedTimesliceInformation } from "../types";

interface ReflectionTimesliceInfoDialogProps {
  _dialogId?: string;
  timesliceInfo: EnhancedTimesliceInformation | null;
}

const ReflectionTimesliceInfoDialog: React.FC<
  ReflectionTimesliceInfoDialogProps
> = ({ _dialogId, timesliceInfo }) => {
  const { t } = useI18n();

  useEffect(() => {
    if (!_dialogId) return;

    const activity = timesliceInfo?.activity;
    const activityName = activity?.name || t("reflection.activityLabel");
    const title = `${activityName} ${t("reflection.details")}`;

    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: title,
        titleButtonComponent: activity ? (
          <ActivityBox
            activity={activity}
            boxHeight={20}
            boxWidth={60}
            showTitle={false}
            marginBottom={-2}
          />
        ) : null,
        rightActionElement: t("common.done") || "Done",
        onRightAction: () => {
          useDialogStore.getState().closeDialog(_dialogId);
        },
        titleFontSize: 18,
        rightActionFontSize: 14,
      },
      height: 70,
    });
  }, [_dialogId, t, timesliceInfo?.activity]);

  return (
    <View style={{ flex: 1 }}>
      <ReflectionTimesliceInfo timesliceInfo={timesliceInfo} />
    </View>
  );
};

export default ReflectionTimesliceInfoDialog;
