import type { Activity } from "@/shared/types/models/activity";
import type { GridConfig } from "./components/utils/gridUtils";

// Re-export shared types
export type { GridConfig };

// Activity modes
export type ActivityMode = "view" | "edit";

// Common activity handler types
export type ActivityHandler = (activity: Activity) => void;
export type ActivityIdHandler = (activityId: string) => void;
export type VoidHandler = () => void;

// Main Activities component props
export interface ActivitiesProps {
  mode?: ActivityMode;
  onActivityPress?: ActivityHandler;
  onActivityLongPress?: ActivityHandler;
  onEditActivity?: ActivityHandler;
  onDeleteActivity?: ActivityIdHandler;
  onAddActivity?: VoidHandler;
  gridConfig?: Partial<GridConfig>;
}

// Component props for individual UI components
export interface ActivityGridViewProps {
  activities: Activity[];
  onActivityPress: ActivityHandler;
  onActivityLongPress: ActivityHandler;
  gridConfig?: Partial<GridConfig>;
}

export interface EditActivitiesViewProps {
  activities: Activity[];
  onActivityPress: ActivityHandler;
  onDragStateChange?: (isDragging: boolean) => void;
  gridConfig?: Partial<GridConfig>;
  onAddActivity?: VoidHandler;
  onDeleteActivity?: ActivityIdHandler;
}

export interface ActivityBoxProps {
  activity: Activity;
  onPress: ActivityHandler;
  onLongPress?: ActivityHandler;
  gridConfig?: Partial<GridConfig>;
  style?: any;
  boxWidth?: string | number;
}

// Drag operation types
export type DragStartHandler = (activityId: string) => void;
export type DragEndHandler = () => void;
export type ReorderHandler = (fromIndex: number, toIndex: number) => void;
export type PlaceholderChangeHandler = (index: number | null) => void;

export interface DraggableActivityItemProps {
  activity: Activity;
  index: number;
  activityOrder: Activity[];
  onActivityPress: ActivityHandler;
  onDragStart: DragStartHandler;
  onDragEnd: DragEndHandler;
  onReorder: ReorderHandler;
  onPlaceholderChange: PlaceholderChangeHandler;
  gridConfig?: Partial<GridConfig>;
  containerWidth: number;
  isShakeMode: boolean;
  draggedActivityId: string | null;
  dragPlaceholderIndex: number | null;
  onDeleteActivity: ActivityIdHandler;
}

// Dialog types
export type DialogMode = "legend" | "edit-management" | "create-form" | "edit-form";
export type ActivityCreatedHandler = (activity: Activity) => void;
export type ActivityUpdatedHandler = (activity: Activity) => void;
export type ActivitySelectedHandler = (activity: Activity) => void;

export interface ActivityDialogProps {
  mode?: DialogMode;
  activity?: Activity;
  onActivityCreated?: ActivityCreatedHandler;
  onActivityUpdated?: ActivityUpdatedHandler;
  onActivitySelected?: ActivitySelectedHandler;
  confirm?: VoidHandler;
  headerProps?: any;
  _dialogId?: string;
  isPickingMode?: boolean;
}

// Form types
export type FormSubmitHandler = (values: Partial<Activity>) => Promise<void>;

export interface ActivityFormProps {
  initialValues?: Partial<Activity>;
  onSubmit: FormSubmitHandler;
  onCancel: VoidHandler;
  isSubmitting?: boolean;
  submitLabel?: string;
}

// Hook return types with consistent naming
export interface UseActivitiesDataReturn {
  activities: Activity[];
  disabledActivities: Activity[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface UseActivitiesActionsReturn {
  handleActivityPress: ActivityHandler;
  handleActivityLongPress: ActivityHandler;
  refresh: () => Promise<void>;
}

export interface UseActivityLegendReturn {
  isVisible: boolean;
  show: VoidHandler;
  hide: VoidHandler;
  toggle: VoidHandler;
}

// Validation types
export interface ValidationErrors {
  name: string | null;
  category: string | null;
}

export interface ValidationState {
  name: boolean;
  category: boolean;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  tension?: number;
  friction?: number;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Common component props
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}
