import { ActivityBox } from "@/features/activity/components/ui";
import GridView from "@/features/activity/components/ui/GridView";
import { reassignTimeslicesActivity } from "@/shared/api/resources/timeslices/update";
import { useI18n } from "@/shared/hooks/useI18n";
import { useActivitiesStore, useDialogStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

type Props = {
  _dialogId?: string;
  activity: Activity;
  timesliceIds: string[];
  parentDialogId?: string; // the Edit dialog id to return to/close
};

const ReassignActivityDialog: React.FC<Props> = ({
  _dialogId,
  activity,
  timesliceIds,
  parentDialogId,
}) => {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const softDeleteActivity = useActivitiesStore((s) => s.softDeleteActivity);
  const enabled = useActivitiesStore((s) => s.activities) || [];
  const disabled = useActivitiesStore((s) => s.disabledActivities) || [];

  const candidates = useMemo(() => {
    const combined = [...enabled, ...disabled];
    return combined.filter((a) => a.id && a.id !== activity.id) as Activity[];
  }, [enabled, disabled, activity.id]);

  // perform reassignment immediately when user picks a replacement
  const performReassign = async (replacementId: string) => {
    try {
      await reassignTimeslicesActivity(timesliceIds, replacementId);
      await softDeleteActivity(activity.id!);
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
      if (parentDialogId) useDialogStore.getState().closeDialog(parentDialogId);
    } catch (error) {
      GlobalErrorHandler.logError(error, "REASSIGN_ACTIVITY_DIALOG_PERFORM", {
        activityId: activity.id,
        replacementId,
        timeslices: timesliceIds.length,
      });
    }
  };

  // Configure header: show back (left) and set the right action (kept for parity but main action is on item press)
  useEffect(() => {
    if (!_dialogId) return;
    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.legend.reassignTitle"),
        leftActionElement: t("back"),
        onLeftAction: () => {
          // close this dialog to return to parent
          useDialogStore.getState().closeDialog(_dialogId);
        },
        rightActionElement: t("validate"),
        onRightAction: () => {
          // if header validate is pressed and a selection exists, attempt last-selected; otherwise no-op
          // we intentionally don't maintain header selection state here; primary flow is item press
        },
      },
      height: 85,
    });
    // cleanup: remove headerProps when unmounted
    return () => {
      try {
        if (_dialogId)
          useDialogStore.getState().setDialogProps(_dialogId, {
            headerProps: {},
          });
      } catch (e) {
        // ignore
      }
    };
  }, [_dialogId, selectedId, t]);

  return (
    <View style={{ flex: 1, paddingHorizontal: 8, paddingTop: 8 }}>
      <Text style={{ marginBottom: 20, color: "#fff" }}>
        {"This activity is used by timeslices. Pick a replacement:"}
      </Text>
      <GridView
        items={candidates}
        // compute rows based on 4 columns
        totalRows={Math.max(1, Math.ceil(candidates.length / 4))}
        columns={4}
        itemWidth={"25%"}
        itemHeight={96}
        gridGap={8}
        renderItem={(a: Activity, index: number) => (
          <View
            key={a.id}
            style={{
              width: "25%",
              height: 96,
              marginBottom: 8,
              paddingHorizontal: 6,
            }}
          >
            <ActivityBox
              activity={a}
              onPress={() => void performReassign(a.id!)}
              showTitle={true}
              boxWidth={"100%"}
            />
          </View>
        )}
      />
    </View>
  );
};

export default ReassignActivityDialog;
