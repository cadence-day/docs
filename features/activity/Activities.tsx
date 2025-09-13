import { styles } from "@/features/activity/styles";
import type { ActivitiesProps } from "@/features/activity/types";
import React, { useMemo } from "react";
import { View } from "react-native";
import { EditActivitiesView } from "./components";
import { ActivityGridView, ErrorState, LoadingState } from "./components/ui";
import { createDefaultGridConfig } from "./components/utils/gridUtils";
import { useActivitiesActions, useActivitiesData } from "./hooks";

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
    const { handleActivityPress, handleActivityLongPress, refresh } =
      useActivitiesActions({
        onActivityPress,
        onActivityLongPress,
        onEditActivity,
      });

    // Memoize effective grid configuration
    const effectiveGridConfig = useMemo(
      () => createDefaultGridConfig(gridConfig),
      [gridConfig]
    );

    // Memoize combined activities for edit mode
    const combinedActivities = useMemo(
      () => [...activities, ...disabledActivities],
      [activities, disabledActivities]
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
    if (mode === "edit") {
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
          onActivityLongPress={handleActivityLongPress}
          gridConfig={effectiveGridConfig}
        />
      </View>
    );
  }
);

Activities.displayName = "Activities";

export default React.memo(Activities);
