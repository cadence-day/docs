import { COLORS } from "@/shared/constants/COLORS";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StreakData } from "../types/insights";

interface StreakVisualizationProps {
  streakData: StreakData;
  type: "weekly" | "monthly";
}

/**
 * Component to visualize streak data as horizontal rows of dots
 * Weekly: 7 dots in a single row (Mon-Sun)
 * Monthly: 31 dots in multiple rows (7 dots per row, aligned with Mon-Sun)
 * Future dates are not rendered
 */
export const StreakVisualization: React.FC<StreakVisualizationProps> = ({
  streakData,
  type,
}) => {
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Determine number of dots based on type
  const numDots = type === "weekly" ? 7 : 31;

  // Ensure activeDays array has the correct length
  const activeDays = streakData.activeDays.slice(0, numDots);
  while (activeDays.length < numDots) {
    activeDays.push(false);
  }

  const dotsPerRow = 7;

  // For monthly view, calculate offset to align with Mon-Sun
  let startDayOffset = 0;
  if (type === "monthly" && streakData.startDate) {
    // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = streakData.startDate.getDay();
    // Convert to Monday-based offset (Monday = 0, Sunday = 6)
    startDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  }

  // Create rows with proper alignment for monthly view
  interface CellData {
    isActive: boolean;
    dayNumber: number | null; // null for empty cells
    isFuture: boolean; // true if this day is in the future
  }

  const rows: CellData[][] = [];

  if (type === "monthly") {
    // Add empty cells at the start for alignment
    const allCells: CellData[] = [];

    // Add empty cells before the first day
    for (let i = 0; i < startDayOffset; i++) {
      allCells.push({ isActive: false, dayNumber: null, isFuture: false });
    }

    // Add actual days
    for (let i = 0; i < activeDays.length; i++) {
      const dayDate = new Date(streakData.startDate);
      dayDate.setDate(dayDate.getDate() + i);
      dayDate.setHours(0, 0, 0, 0);

      const isFuture = dayDate > today;

      allCells.push({
        isActive: activeDays[i],
        dayNumber: i + 1,
        isFuture,
      });
    }

    // Split into rows of 7
    for (let i = 0; i < allCells.length; i += dotsPerRow) {
      rows.push(allCells.slice(i, i + dotsPerRow));
    }
  } else {
    // Weekly view - show actual calendar day numbers
    const weekCells: CellData[] = activeDays.map((isActive, index) => {
      // Calculate the actual date for this day
      const dayDate = new Date(streakData.startDate);
      dayDate.setDate(dayDate.getDate() + index);
      dayDate.setHours(0, 0, 0, 0);

      const isFuture = dayDate > today;

      return {
        isActive,
        dayNumber: dayDate.getDate(), // Day of month (1-31)
        isFuture,
      };
    });
    rows.push(weekCells);
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((cell, cellIndex) => {
            // Don't render future date circles
            if (cell.isFuture) {
              return null;
            }

            if (cell.dayNumber === null) {
              // Empty placeholder cell
              return (
                <View
                  key={`empty-${rowIndex}-${cellIndex}`}
                  style={[styles.dot, styles.emptyDot]}
                />
              );
            }

            return (
              <View
                key={`dot-${rowIndex}-${cellIndex}`}
                style={[
                  styles.dot,
                  {
                    backgroundColor: cell.isActive
                      ? COLORS.brand.primary
                      : "#5E5E5E",
                  },
                ]}
              >
                <Text style={styles.dayNumber}>{cell.dayNumber}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    width: "100%",
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDot: {
    backgroundColor: "transparent",
  },
  dayNumber: {
    fontFamily: TYPOGRAPHY.fontFamilies.primary,
    fontSize: 11,
    color: "#A1A1A1",
  },
});
