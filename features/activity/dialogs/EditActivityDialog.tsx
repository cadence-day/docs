import { ActivityForm } from "@/features/activity/components/ui/ActivityForm";
import { useI18n } from "@/shared/hooks/useI18n";
import { useActivitiesStore, useDialogStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { getTimeslicesByActivityId } from "@/shared/api/resources/timeslices/get";
import { reassignTimeslicesActivity } from "@/shared/api/resources/timeslices/update";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

type Props = {
  _dialogId?: string;
  activity?: Activity;
};

const EditActivityDialog: React.FC<Props> = ({ _dialogId, activity }) => {
  const { t } = useI18n();
  const formRef = useRef<{ submit: () => void }>(null);
  const updateActivity = useActivitiesStore((s) => s.updateActivity);
  const softDeleteActivity = useActivitiesStore((s) => s.softDeleteActivity);
  const allEnabled = useActivitiesStore((s) => s.activities);
  const disabled = useActivitiesStore((s) => s.disabledActivities);

  const [reassignStage, setReassignStage] = useState<{
    required: boolean;
    timesliceIds: string[];
  }>({ required: false, timesliceIds: [] });
  const [replacementId, setReplacementId] = useState<string | null>(null);

  useEffect(() => {
    if (!_dialogId) return;
    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.legend.editActivity"),
        rightActionElement: t("save"),
        onRightAction: () => formRef.current?.submit(),
      },
      height: 85,
    });
  }, [_dialogId, t]);

  const handleSubmit = async (values: Partial<Activity>) => {
    try {
      if (!activity) return;
      const updated = await updateActivity({
        ...activity,
        ...values,
      } as Activity);
      if (_dialogId && updated) {
        useDialogStore.getState().closeDialog(_dialogId);
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, "UPDATE_ACTIVITY", {
        activityId: activity?.id,
      });
    }
  };

  const candidateActivities = useMemo(() => {
    const excludeId = activity?.id;
    const sameCategory = activity?.activity_category_id ?? null;
    // Prefer same category; allow all enabled if none in same category
    const sameCat = allEnabled.filter(
      (a) => a.id !== excludeId && a.activity_category_id === sameCategory
    );
    return sameCat.length > 0
      ? sameCat
      : allEnabled.filter((a) => a.id !== excludeId);
  }, [allEnabled, activity?.id, activity?.activity_category_id]);

  const hasChildren = useMemo(() => {
    const id = activity?.id;
    if (!id) return false;
    const inEnabled = allEnabled.some((a) => a.parent_activity_id === id);
    const inDisabled = disabled.some((a) => a.parent_activity_id === id);
    return inEnabled || inDisabled;
  }, [allEnabled, disabled, activity?.id]);

  const performDeleteNow = useCallback(async () => {
    if (!activity?.id) return;
    // Block if activity has a parent
    if (activity.parent_activity_id) {
      alert(
        t(
          "This activity is a child of another. Change its parent first before deleting."
        )
      );
      return;
    }
    // Block if this activity has children
    if (hasChildren) {
      alert(
        t(
          "This activity has sub-activities. Reassign or remove their parent before deleting."
        )
      );
      return;
    }

    // Inspect timeslices usage
    let ids: string[] = [];
    try {
      const ts = await getTimeslicesByActivityId(activity.id);
      ids = (ts || []).map((x) => x.id!).filter(Boolean) as string[];
    } catch (error) {
      GlobalErrorHandler.logError(error, "FETCH_ACTIVITY_TIMESLICES", {
        activityId: activity.id,
      });
      return;
    }
    if (ids.length === 0) {
      await softDeleteActivity(activity.id);
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
      return;
    }

    // Require reassignment
    setReassignStage({ required: true, timesliceIds: ids });
  }, [activity, hasChildren, softDeleteActivity, t, _dialogId]);

  const performDelete = useCallback(() => {
    Alert.alert(
      t("confirm"),
      t("Are you sure you want to delete this activity? You can’t undo this."),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => void performDeleteNow(),
        },
      ]
    );
  }, [performDeleteNow, t]);

  const confirmReassign = useCallback(async () => {
    try {
      if (!activity?.id || !reassignStage.required || !replacementId) return;
      await reassignTimeslicesActivity(
        reassignStage.timesliceIds,
        replacementId
      );
      await softDeleteActivity(activity.id);
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
    } catch (error) {
      GlobalErrorHandler.logError(error, "REASSIGN_AND_DELETE_ACTIVITY", {
        activityId: activity?.id,
        replacementId,
        timeslices: reassignStage.timesliceIds.length,
      });
    }
  }, [
    activity?.id,
    reassignStage,
    replacementId,
    softDeleteActivity,
    _dialogId,
  ]);

  return (
    <View style={{ flex: 1 }}>
      {/* Inline Delete action per Option B (header remains Save) */}
      {activity?.id ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <TouchableOpacity onPress={performDelete}>
            <Text style={{ color: "#F04438", fontWeight: "600" }}>
              {t("delete")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Reassignment flow */}
      {reassignStage.required ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <Text style={{ marginBottom: 8 }}>
            {t("This activity is used by timeslices. Pick a replacement:")}
          </Text>
          {candidateActivities.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => setReplacementId(a.id!)}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 0.5,
                borderBottomColor: "#444",
                backgroundColor:
                  replacementId === a.id ? "#2a2a2a" : "transparent",
                paddingHorizontal: 6,
              }}
            >
              <Text style={{ color: "#ddd" }}>{a.name}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 10 }} />
          <TouchableOpacity
            disabled={!replacementId}
            onPress={confirmReassign}
            style={{
              opacity: replacementId ? 1 : 0.5,
              alignSelf: "flex-start",
              backgroundColor: "#4CAF50",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              {t("confirm")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ActivityForm
        ref={formRef as any}
        initialValues={activity}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
        }}
        submitLabel={t("save")}
      />
    </View>
  );
};

export default EditActivityDialog;
