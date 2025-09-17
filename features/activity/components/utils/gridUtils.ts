import { GRID_CONFIG } from "../../constants";

export interface GridConfig {
  columns: number;
  itemSpacing?: number;
  containerPadding?: number;
  itemHeight?: number;
  maxWidth?: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface GridCalculationResult {
  totalRows: number;
  itemWidth: string;
  minHeight: number;
  itemHeight: number;
  gridGap: number;
}

// Use centralized constants
export const GRID_CONSTANTS = {
  ITEM_HEIGHT: GRID_CONFIG.ITEM_HEIGHT,
  GRID_GAP: GRID_CONFIG.GRID_GAP,
  DEFAULT_COLUMNS: GRID_CONFIG.DEFAULT_COLUMNS,
  MIN_DRAG_SENSITIVITY: GRID_CONFIG.MIN_DRAG_SENSITIVITY,
} as const;

/**
 * Calculate grid position from linear index
 */
export const getGridPosition = (
  index: number,
  columns: number
): GridPosition => {
  const row = Math.floor(index / columns);
  const col = index % columns;
  return { row, col };
};

/**
 * Calculate linear index from grid position
 */
export const getIndexFromPosition = (
  row: number,
  col: number,
  columns: number
): number => {
  return row * columns + col;
};

/**
 * Optimized grid properties calculation with memoization-friendly structure
 */
export const calculateGridProperties = (
  activitiesCount: number,
  gridConfig: GridConfig
): GridCalculationResult => {
  const columns = gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS;
  const totalRows = Math.ceil(activitiesCount / columns);
  const itemWidth = `${100 / columns}%`;
  const minHeight =
    totalRows * (GRID_CONSTANTS.ITEM_HEIGHT + GRID_CONSTANTS.GRID_GAP);

  return {
    totalRows,
    itemWidth,
    minHeight,
    itemHeight: GRID_CONSTANTS.ITEM_HEIGHT,
    gridGap: GRID_CONSTANTS.GRID_GAP,
  };
};

/**
 * Optimized drag position calculation with configurable sensitivity
 */
export const calculateGridPositionFromDrag = (
  dx: number,
  dy: number,
  currentIndex: number,
  containerWidth: number,
  gridConfig: GridConfig,
  activitiesCount: number
): number => {
  const columns = gridConfig.columns || GRID_CONSTANTS.DEFAULT_COLUMNS;
  const { totalRows } = calculateGridProperties(activitiesCount, gridConfig);
  const actualItemWidth = containerWidth / columns;
  const actualItemHeight = GRID_CONSTANTS.ITEM_HEIGHT + GRID_CONSTANTS.GRID_GAP;

  // Use centralized drag sensitivity
  const deltaRows = Math.round(
    dy / (actualItemHeight * GRID_CONSTANTS.MIN_DRAG_SENSITIVITY)
  );
  const deltaCols = Math.round(
    dx / (actualItemWidth * GRID_CONSTANTS.MIN_DRAG_SENSITIVITY)
  );

  const currentPos = getGridPosition(currentIndex, columns);
  const newRow = Math.max(
    0,
    Math.min(totalRows - 1, currentPos.row + deltaRows)
  );
  const newCol = Math.max(0, Math.min(columns - 1, currentPos.col + deltaCols));

  const newIndex = getIndexFromPosition(newRow, newCol, columns);
  return Math.min(newIndex, activitiesCount - 1);
};

/**
 * Create default grid configuration
 */
export const createDefaultGridConfig = (
  overrides: Partial<GridConfig> = {}
): GridConfig => ({
  columns: GRID_CONSTANTS.DEFAULT_COLUMNS,
  itemSpacing: GRID_CONFIG.DEFAULT_SPACING,
  containerPadding: GRID_CONFIG.DEFAULT_PADDING,
  itemHeight: GRID_CONSTANTS.ITEM_HEIGHT,
  maxWidth: GRID_CONFIG.MAX_WIDTH,
  ...overrides,
});
