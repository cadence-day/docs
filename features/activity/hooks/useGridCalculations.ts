import type { Activity } from "@/shared/types/models/activity";
import { useMemo } from "react";
import type {
  calculateGridProperties,
  createDefaultGridConfig,
  GridCalculationResult,
  GridConfig,
} from "../components/utils/gridUtils";

interface UseGridCalculationsProps {
  activities: Activity[];
  gridConfig?: Partial<GridConfig>;
  includeAddButton?: boolean;
}

interface UseGridCalculationsReturn {
  gridProperties: GridCalculationResult;
  effectiveGridConfig: GridConfig;
  enabledActivities: Activity[];
  disabledActivities: Activity[];
  totalItemsForGrid: number;
}

export const useGridCalculations = ({
  activities,
  gridConfig,
  includeAddButton = false,
}: UseGridCalculationsProps): UseGridCalculationsReturn => {
  // Memoize filtered activities
  const { enabledActivities, disabledActivities } = useMemo(
    () => ({
      enabledActivities: activities.filter((a) => a.status === "ENABLED"),
      disabledActivities: activities.filter((a) => a.status === "DISABLED"),
    }),
    [activities],
  );

  // Memoize effective grid configuration
  const effectiveGridConfig = useMemo(
    () => createDefaultGridConfig(gridConfig),
    [gridConfig],
  );

  // Memoize total items for grid calculation
  const totalItemsForGrid = useMemo(
    () => enabledActivities.length + (includeAddButton ? 1 : 0),
    [enabledActivities.length, includeAddButton],
  );

  // Memoize grid properties calculation
  const gridProperties = useMemo(
    () => calculateGridProperties(totalItemsForGrid, effectiveGridConfig),
    [totalItemsForGrid, effectiveGridConfig],
  );

  return {
    gridProperties,
    effectiveGridConfig,
    enabledActivities,
    disabledActivities,
    totalItemsForGrid,
  };
};

// Specialized hook for activity management scenarios
export const useActivityManagementGrid = (
  activities: Activity[],
  gridConfig?: Partial<GridConfig>,
) => {
  return useGridCalculations({
    activities,
    gridConfig,
    includeAddButton: true,
  });
};

// Specialized hook for activity display scenarios
// Note: This now expects pre-ordered activities to maintain order consistency
export const useActivityDisplayGrid = (
  orderedActivities: Activity[],
  gridConfig?: Partial<GridConfig>,
) => {
  return useGridCalculations({
    activities: orderedActivities,
    gridConfig,
    includeAddButton: false,
  });
};
