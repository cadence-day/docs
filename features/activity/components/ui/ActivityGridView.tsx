import { useActivitiesStore } from "@/shared/stores";
import type { Activity } from "@/shared/types/models/activity";
import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useActivityDisplayGrid } from "../../hooks";
import type { ActivityGridViewProps } from "../../types";
import { ActivityBox } from "./ActivityBox";

// Memoized activity item component for better performance
const ActivityGridItem = React.memo<{
  activity: Activity;
  itemWidth: string;
  itemHeight: number;
  gridGap: number;
  onPress: (activity: Activity) => void;
  onLongPress: (activity: Activity) => void;
}>(({ activity, itemWidth, itemHeight, gridGap, onPress, onLongPress }) => {
  const handlePress = useCallback(() => onPress(activity), [activity, onPress]);
  const handleLongPress = useCallback(
    () => onLongPress(activity),
    [activity, onLongPress]
  );

  return (
    <View
      style={[
        styles.gridItem,
        {
          width: itemWidth as any,
          height: itemHeight,
          marginBottom: gridGap,
        },
      ]}
    >
      <ActivityBox
        activity={activity}
        onPress={handlePress}
        onLongPress={handleLongPress}
        boxWidth="100%"
      />
    </View>
  );
});

ActivityGridItem.displayName = "ActivityGridItem";

export const ActivityGridView = React.memo<ActivityGridViewProps>(
  ({ onActivityPress, onActivityLongPress, gridConfig }) => {
    // Get ordered activities directly from store (single source of truth)
    const storeActivities = useActivitiesStore((state) => state.activities);
    const loadStoredOrder = useActivitiesStore(
      (state) => state.loadStoredOrder
    );

    // Load stored order on mount to ensure we have the correct order
    useEffect(() => {
      loadStoredOrder();
    }, [loadStoredOrder]);

    // Use optimized hook for grid calculations with store activities
    const { gridProperties, enabledActivities } = useActivityDisplayGrid(
      storeActivities,
      gridConfig
    );

    const { minHeight, itemWidth, itemHeight, gridGap } = gridProperties;

    // Memoize container style
    const containerStyle = useMemo(
      () => [styles.container, { minHeight }],
      [minHeight]
    );

    return (
      <View style={containerStyle}>
        <View style={styles.grid}>
          {enabledActivities.map((activity) => (
            <ActivityGridItem
              key={activity.id}
              activity={activity}
              itemWidth={itemWidth}
              itemHeight={itemHeight}
              gridGap={gridGap}
              onPress={onActivityPress}
              onLongPress={onActivityLongPress}
            />
          ))}
        </View>
      </View>
    );
  }
);

ActivityGridView.displayName = "ActivityGridView";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  grid: {
    position: "relative",
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  gridItem: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
});
