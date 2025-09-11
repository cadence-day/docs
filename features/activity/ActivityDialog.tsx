import { useI18n } from "@/shared/hooks/useI18n";
import {
  useActivitiesStore,
  useDialogStore,
  useSelectionStore,
} from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import Activities from "./Activities";
import { ActivityForm } from "./components/ui/ActivityForm";

export type ActivityDialogHandle = {
  confirm: () => void;
};

export type ActivityDialogMode =
  | "legend" // Show activity grid for selection
  | "edit-management" // Show edit mode for managing activities
  | "create-form" // Show form for creating new activity
  | "edit-form"; // Show form for editing existing activity

export interface ActivityDialogProps {
  mode?: ActivityDialogMode;
  activity?: Activity; // For edit-form mode
  onActivityCreated?: (activity: Activity) => void;
  onActivityUpdated?: (activity: Activity) => void;
  onActivitySelected?: (activity: Activity) => void; // For legend mode
  // optional confirm callback that DialogHost will call when Done is pressed
  confirm?: () => void;
  // optional headerProps to display custom title
  headerProps?: any;
  // internal: dialog id when rendered via DialogHost
  _dialogId?: string;
  // Context for dynamic behavior
  isPickingMode?: boolean; // When true, shows "Pick an activity first" state
}

export const ActivityDialog = forwardRef<
  ActivityDialogHandle,
  ActivityDialogProps
>(
  (
    {
      mode = "legend",
      activity,
      onActivityCreated,
      onActivityUpdated,
      onActivitySelected,
      confirm,
      headerProps,
      _dialogId,
      isPickingMode = false,
    },
    ref
  ) => {
    const { t } = useI18n();
    const selectedActivityId = useSelectionStore(
      (state) => state.selectedActivityId
    );
    const setSelectedActivityId = useSelectionStore(
      (state) => state.setSelectedActivityId
    );
    const insertActivity = useActivitiesStore((state) => state.insertActivity);
    const updateActivity = useActivitiesStore((state) => state.updateActivity);
    const loadStoredOrder = useActivitiesStore(
      (state) => state.loadStoredOrder
    );

    // Local state for managing modes and form data
    const [currentMode, setCurrentMode] = useState<ActivityDialogMode>(mode);
    const [isPickingState, setIsPickingState] = useState(isPickingMode);
    const [formValues, setFormValues] = useState<Partial<Activity>>(
      currentMode === "edit-form" && activity ? activity : {}
    );

    // Ref to access form submit function
    const formRef = useRef<{ submit: () => void }>(null);
    React.useEffect(() => {
      useActivitiesStore.getState().getAllActivities();
      loadStoredOrder(); // Load stored activity order
      console.log("Fetching activities for dialog");
      const activities = useActivitiesStore.getState().activities;
      console.log("Activities fetched:", activities);
    }, [loadStoredOrder]);

    // Update form values when activity prop changes
    React.useEffect(() => {
      if (currentMode === "edit-form" && activity) {
        setFormValues(activity);
      }
    }, [currentMode, activity]);

    // Dynamic title based on mode and state
    const getTitle = () => {
      if (isPickingState) return t("pick-activity-first");

      switch (currentMode) {
        case "legend":
          return t("activity.legend.activities");
        case "edit-management":
          return t("activity.legend.editActivities");
        case "create-form":
          return t("activity.legend.createActivity");
        case "edit-form":
          return t("activity.legend.editActivity");
        default:
          return t("activity.legend.activities");
      }
    };

    // Dynamic height based on mode and state
    const getHeight = () => {
      if (isPickingState) return 50;
      if (currentMode === "edit-management") return 85;
      // Create should be compact (30%); editing a specific activity should allow full height (100%)
      if (currentMode === "create-form") return 85;
      if (currentMode === "edit-form") return 85;
      return 28;
    };

    // Dynamic right action based on mode
    const getRightAction = () => {
      switch (currentMode) {
        case "legend":
          return {
            text: t("edit"),
            action: () => setCurrentMode("edit-management"),
          };
        case "edit-management":
          return {
            text: t("done"),
            action: () => setCurrentMode("legend"),
          };
        case "create-form":
        case "edit-form":
          return {
            text: t("done"),
            action: () => formRef.current?.submit(),
          };
        default:
          return { text: t("done"), action: handleConfirm };
      }
    };

    // Dynamic left action for form modes (back arrow)
    const getLeftAction = () => {
      if (currentMode === "create-form" || currentMode === "edit-form") {
        return {
          action: () => setCurrentMode("edit-management"),
        };
      }
      return undefined;
    };

    // Handlers for different modes
    const handleActivityPress = (selectedActivity: Activity) => {
      if (currentMode === "legend") {
        // In legend mode, selecting an activity sets it as selected
        setSelectedActivityId(selectedActivity.id);
        onActivitySelected?.(selectedActivity);

        // Exit picking mode if we were in it
        setIsPickingState(false);
      } else if (currentMode === "edit-management") {
        // In edit management mode, pressing opens edit form
        setFormValues(selectedActivity);
        setCurrentMode("edit-form");
      }
    };

    const handleActivityLongPress = (selectedActivity: Activity) => {
      // Long press always opens edit form
      setFormValues(selectedActivity);
      setCurrentMode("edit-form");
    };

    const handleAddActivity = () => {
      setFormValues({});
      setCurrentMode("create-form");
    };

    const handleFormSubmit = async (values: Partial<Activity>) => {
      setFormValues(values);

      // Immediately proceed with the actual submission
      try {
        if (currentMode === "create-form") {
          const newActivity = await insertActivity({
            ...values,
            status: "ENABLED",
          } as Omit<Activity, "id">);

          if (newActivity) {
            onActivityCreated?.(newActivity);
            alert(t("activity-created-successfully"));
            setCurrentMode("edit-management"); // Return to management view
          } else {
            alert("Failed to create activity");
            return;
          }
        } else if (currentMode === "edit-form" && activity?.id) {
          const updated = { ...activity, ...values } as Activity;
          const result = await updateActivity(updated);

          if (result) {
            onActivityUpdated?.(result);
            alert(t("activity-updated-successfully"));
            setCurrentMode("edit-management"); // Return to management view
          } else {
            alert("Failed to update activity");
            return;
          }
        }
      } catch (error: any) {
        alert(
          `Failed to ${currentMode === "create-form" ? "create" : "update"} activity: ` +
            (error?.message || "Unknown error")
        );
      }
    };

    const handleConfirm = () => {
      confirm?.();
      try {
        if (_dialogId) useDialogStore.getState().closeDialog(_dialogId);
      } catch (e) {
        // ignore
      }
    };

    const handleCancel = () => {
      if (currentMode === "create-form" || currentMode === "edit-form") {
        // Return to previous mode
        setCurrentMode("edit-management");
      } else {
        handleConfirm();
      }
    };

    // Method to enter picking mode (called from timeline)
    const enterPickingMode = () => {
      setIsPickingState(true);
      setCurrentMode("legend");
    };

    // Update dialog props with dynamic values
    React.useEffect(() => {
      try {
        if (_dialogId) {
          const rightAction = getRightAction();
          const leftAction = getLeftAction();
          useDialogStore.getState().setDialogProps(_dialogId, {
            headerProps: {
              title: getTitle(),
              rightActionElement: rightAction.text,
              onRightAction: rightAction.action,
              ...(leftAction && {
                onLeftAction: leftAction.action,
              }),
            },
            height: getHeight(),
            enterPickingMode, // Expose method for timeline to call
          });
        }
      } catch (e) {
        // ignore
      }
    }, [currentMode, isPickingState, _dialogId, t]);

    // Listen to activity selection changes to exit picking mode
    React.useEffect(() => {
      if (selectedActivityId && isPickingState) {
        setIsPickingState(false);
      }
    }, [selectedActivityId, isPickingState]);

    useImperativeHandle(ref, () => ({
      confirm: handleConfirm,
    }));

    // Render different content based on current mode
    const renderContent = () => {
      switch (currentMode) {
        case "legend":
          return (
            <View style={{ flex: 1 }}>
              <Activities
                mode="view"
                onActivityPress={handleActivityPress}
                onActivityLongPress={handleActivityLongPress}
                gridConfig={{
                  columns: 4,
                }}
              />
            </View>
          );
        case "edit-management":
          return (
            <View style={{ flex: 1 }}>
              <Activities
                mode="edit"
                onActivityPress={handleActivityPress}
                onActivityLongPress={handleActivityLongPress}
                onEditActivity={handleActivityLongPress}
                onAddActivity={handleAddActivity}
                gridConfig={{
                  columns: 4,
                }}
              />
            </View>
          );

        case "create-form":
        case "edit-form":
          return (
            <ActivityForm
              ref={formRef}
              initialValues={formValues}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              submitLabel={
                currentMode === "create-form" ? t("create") : t("save")
              }
            />
          );

        default:
          return null;
      }
    };

    return renderContent();
  }
);

ActivityDialog.displayName = "ActivityDialog";

export default ActivityDialog;
