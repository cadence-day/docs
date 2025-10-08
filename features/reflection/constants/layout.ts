/**
 * Shared layout constants for the reflection grid system
 * These ensure consistent alignment across all reflection components
 */

export const REFLECTION_LAYOUT = {
  // Grid configuration
  NUM_DAYS: 7,
  START_HOUR: 0,
  END_HOUR: 24,
  MINUTES_PER_SLOT: 30,
  SELECTED_OPACITY: 0.1,

  // Layout dimensions
  TIME_COLUMN_WIDTH: 22,
  HEADER_HEIGHT: 35,
  CELL_HEIGHT: 18,
  CELL_MARGIN: 1,
  CELL_BORDER_RADIUS: 5,

  // Computed dimensions for consistency
  get ROW_HEIGHT() {
    return this.CELL_HEIGHT + this.CELL_MARGIN;
  },

  // Visual properties
  BORDER_COLOR: "#ccc",
  BORDER_WIDTH: 1,
} as const;

export type ReflectionLayoutConfig = typeof REFLECTION_LAYOUT;
