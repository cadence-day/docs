/**
 * MonthlyReflectionCell Component
 *
 * Simplified cell component for the monthly reflection grid.
 * Displays only activity colors without notes or mood indicators for a cleaner monthly view.
 *
 * Feature Flag: This component is part of the 'monthly-reflection' feature flag.
 * The flag is checked in the parent reflection screen (app/(home)/reflection.tsx).
 */

import useActivitiesStore from "@/shared/stores/resources/useActivitiesStore";
import { Timeslice } from "@/shared/types/models";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { REFLECTION_LAYOUT } from "../constants/layout";

interface MonthlyReflectionCellProps {
  timeslice: Timeslice;
  onPress: () => void;
  onLongPress: () => void;
  dimmed?: boolean;
  notSelectedOpacity?: number;
  isSelected?: boolean;
  cellWidth?: number;
  cellHeight?: number;
}

/**
 * Simplified cell component for monthly reflection grid
 * Does not include notes or mood indicators, only activity color
 */
export const MonthlyReflectionCell: React.FC<MonthlyReflectionCellProps> = ({
  timeslice,
  onPress,
  onLongPress,
  dimmed = false,
  notSelectedOpacity = 1,
  isSelected = false,
  cellWidth,
  cellHeight,
}) => {
  const activities = useActivitiesStore((state) => state.activities);
  const disabledActivities = useActivitiesStore(
    (state) => state.disabledActivities
  );

  // Find the activity for this timeslice
  const activity = useMemo(() => {
    if (!timeslice.activity_id) return null;
    return (
      activities.find((a) => a.id === timeslice.activity_id) ||
      disabledActivities.find((a) => a.id === timeslice.activity_id)
    );
  }, [timeslice.activity_id, activities, disabledActivities]);

  // Determine cell background color
  const cellBackgroundColor = activity?.color || "#E0E0E0";

  // Calculate opacity based on selection state
  const finalOpacity = dimmed ? notSelectedOpacity : 1;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.cell,
        {
          width: cellWidth || REFLECTION_LAYOUT.COLUMN_WIDTH,
          height: cellHeight || REFLECTION_LAYOUT.ROW_HEIGHT,
          backgroundColor: cellBackgroundColor,
          opacity: finalOpacity,
        },
        isSelected && styles.selectedCell,
        pressed && styles.pressedCell,
      ]}
    >
      <View style={styles.cellContent} />
    </Pressable>
  );
};

/**
 * Empty cell for monthly reflection grid
 */
export const EmptyMonthlyReflectionCell: React.FC<{
  dimmed?: boolean;
  notSelectedOpacity?: number;
  onLongPress?: () => void;
  cellWidth?: number;
  cellHeight?: number;
}> = ({
  dimmed = false,
  notSelectedOpacity = 1,
  onLongPress,
  cellWidth,
  cellHeight,
}) => {
  const finalOpacity = dimmed ? notSelectedOpacity : 1;

  return (
    <Pressable
      onLongPress={onLongPress}
      style={[
        styles.cell,
        styles.emptyCell,
        {
          width: cellWidth || REFLECTION_LAYOUT.COLUMN_WIDTH,
          height: cellHeight || REFLECTION_LAYOUT.ROW_HEIGHT,
          opacity: finalOpacity,
        },
      ]}
    >
      <View style={styles.cellContent} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    borderWidth: REFLECTION_LAYOUT.BORDER_WIDTH,
    borderColor: REFLECTION_LAYOUT.BORDER_COLOR,
    borderRadius: REFLECTION_LAYOUT.CELL_BORDER_RADIUS,
    marginRight: REFLECTION_LAYOUT.CELL_MARGIN,
    marginBottom: REFLECTION_LAYOUT.CELL_MARGIN,
    justifyContent: "center",
    alignItems: "center",
  },
  cellContent: {
    width: "100%",
    height: "100%",
  },
  emptyCell: {
    backgroundColor: "#F5F5F5",
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: "#6646EC",
    transform: [{ scale: 1.02 }],
  },
  pressedCell: {
    opacity: 0.7,
  },
});
