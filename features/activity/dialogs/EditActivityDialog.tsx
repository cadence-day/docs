import { ActivityForm } from "@/features/activity/components/ui/ActivityForm";
import { getTimeslicesByActivityId } from "@/shared/api/resources/timeslices/get";
import { CdButton } from "@/shared/components/CadenceUI";
import { useI18n } from "@/shared/hooks/useI18n";
import { useActivitiesStore, useDialogStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  _dialogId?: string;
  activity?: Activity;
};

const EditActivityDialog: React.FC<Props> = ({ _dialogId, activity }) => {
  const { t } = useI18n();
  const formRef = useRef<{ submit: () => void }>(null);
  const updateActivity = useActivitiesStore((s) => s.updateActivity);
  const softDeleteActivity = useActivitiesStore((s) => s.softDeleteActivity);
  const disableActivity = useActivitiesStore((s) => s.disableActivity);

  useEffect(() => {
    if (!_dialogId) return;
    useDialogStore.getState().setDialogProps(_dialogId, {
      headerProps: {
        title: t("activity.legend.editActivity"),
        rightActionElement: t("save"),
        onRightAction: () => formRef.current?.submit(),
        // Add a left/back action that closes the dialog without submitting
        onLeftAction: () => {
          useDialogStore.getState().closeDialog(_dialogId);
        },
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
  const performDeleteNow = useCallback(async () => {
    try {
      if (!activity?.id) return;
      const timeslices = await getTimeslicesByActivityId(activity.id);
      if (!timeslices || timeslices.length === 0) {
        await softDeleteActivity(activity.id);
        if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
        return;
      }

      // Open a dedicated reassignment dialog so user can pick replacement
      useDialogStore.getState().openDialog({
        type: "reassign-activity",
        props: {
          activity,
          timesliceIds: timeslices.map((ts) => ts.id!),
          parentDialogId: _dialogId,
        },
      });
    } catch (error) {
      GlobalErrorHandler.logError(error, "PERFORM_DELETE_NOW", {
        activityId: activity?.id,
      });
    }
  }, [activity, softDeleteActivity, _dialogId]);

  const performDelete = useCallback(() => {
    Alert.alert(
      t("confirm"),
      "Are you sure you want to delete this activity? You can’t undo this.",
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

  const performDisable = useCallback(async () => {
    if (!activity?.id) return;
    try {
      await disableActivity(activity.id!);
      if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
    } catch (error) {
      GlobalErrorHandler.logError(error, "DISABLE_ACTIVITY", {
        activityId: activity.id,
      });
    }
  }, [activity?.id, disableActivity, _dialogId]);

  const openDeleteMenu = useCallback(() => {
    // Use native ActionSheet on iOS for contextual choices
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            t("cancel"),
            t("temporarily-disable-activity"),
            t("delete"),
          ],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          if (buttonIndex === 1) return void performDisable();
          if (buttonIndex === 2) return void performDelete();
        }
      );
      return;
    }

    // Fallback for Android / other platforms: use simple Alert with choices
    Alert.alert(t("choose_action"), "", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("temporarily-disable-activity"),
        onPress: () => performDisable(),
      },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => performDelete(),
      },
    ]);
  }, [performDelete, performDisable, t]);

  // Reassignment is handled in the separate `reassign-activity` dialog

  return (
    <View style={localStyles.container}>
      <ActivityForm
        ref={formRef as React.RefObject<{ submit: () => void }>}
        _dialogId={_dialogId}
        initialValues={activity}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
        }}
        submitLabel={t("save")}
      />
      {activity?.id ? (
        <View style={localStyles.footerPadding}>
          <CdButton
            title={t("delete")}
            onPress={openDeleteMenu}
            variant="outline"
            size="medium"
            fullWidth={true}
          />
        </View>
      ) : null}

      {/* Reassignment moved to a dedicated dialog when needed */}
    </View>
  );
};

export default EditActivityDialog;

const localStyles = StyleSheet.create({
  container: { flex: 1 },
  footerPadding: { padding: 20 },
});
