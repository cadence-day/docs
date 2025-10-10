import { styles } from "@/features/activity/styles";
import type { ActivitiesProps } from "@/features/activity/types";
import type { Activity } from "@/shared/types/models/activity";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { EditActivitiesView } from ".";
import { useActivitiesActions, useActivitiesData } from "../hooks";
import { ActivityGridView, ErrorState, LoadingState } from "./ui";
import { createDefaultGridConfig } from "./utils/gridUtils";

export interface ActivitiesRef {
  refresh: () => Promise<void>;
}

const Activities = React.forwardRef<ActivitiesRef, ActivitiesProps>(
  (
    {
      mode = "view",
      onActivityPress,
      onActivityLongPress,
      gridConfig,
      onAddActivity,
      onEditActivity,
      onDisableActivity,
    },
    ref
  ) => {
    const { activities, disabledActivities, isLoading, error } =
      useActivitiesData();

    // Internal state to manage edit mode when not controlled by props
    const [internalMode, setInternalMode] = useState<"view" | "edit">("view");

    // Use prop mode if provided, otherwise use internal state
    const currentMode = mode !== "view" ? mode : internalMode;

    // Enhanced long press handler that can enter edit mode
    const handleEnhancedActivityLongPress = useCallback(
      (activity: Activity) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // If we're in view mode and no external mode control, enter edit mode
        if (mode === "view" && currentMode === "view") {
          setInternalMode("edit");
        }

        // Call the original handlers
        onActivityLongPress?.(activity);
        onEditActivity?.(activity);
      },
      [mode, currentMode, onActivityLongPress, onEditActivity]
    );

    const { handleActivityPress, refresh } = useActivitiesActions({
      onActivityPress,
      onActivityLongPress: handleEnhancedActivityLongPress,
      onEditActivity,
    });

    // Memoize effective grid configuration
    const effectiveGridConfig = useMemo(
      () => createDefaultGridConfig(gridConfig),
      [gridConfig]
    );

    React.useImperativeHandle(
      ref,
      () => ({
        refresh,
      }),
      [refresh]
    );

    // Show loading state for initial load
    if (
      isLoading &&
      activities.length === 0 &&
      disabledActivities.length === 0
    ) {
      return (
        <View style={styles.container}>
          <LoadingState message="Loading activities..." />
        </View>
      );
    }

    // Show error state if there's an error and no data
    if (error && activities.length === 0 && disabledActivities.length === 0) {
      return (
        <View style={styles.container}>
          <ErrorState message={error} onRetry={refresh} />
        </View>
      );
    }

    // Render edit mode
    if (currentMode === "edit") {
      return (
        <EditActivitiesView
          onActivityPress={handleActivityPress}
          gridConfig={effectiveGridConfig}
          onAddActivity={onAddActivity}
          onDisableActivity={onDisableActivity}
        />
      );
    }

    // Render view mode
    return (
      <View style={styles.container}>
        <ActivityGridView
          onActivityPress={handleActivityPress}
          onActivityLongPress={handleEnhancedActivityLongPress}
          gridConfig={effectiveGridConfig}
        />
      </View>
    );
  }
);

Activities.displayName = "Activities";

export default React.memo(Activities);
