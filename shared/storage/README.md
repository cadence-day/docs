# Activity Storage System

This document describes the new activity storage system that provides persistent, organized storage for activity ordering and related operations.

## Overview

The storage system is organized into logical namespaces to separate different types of data:

- **`shared/storage/activities/`** - Activity-specific storage (ordering, preferences)
- **`shared/storage/ui/`** - UI preferences (grid config, layout)
- **`shared/storage/user/`** - User-specific data (reserved for future use)

## Key Features

### 1. Activity Order Persistence

- Maintains separate ordering for enabled and disabled activities
- Preserves position when activities are disabled/enabled
- Automatic cleanup when activities are deleted
- Optimistic updates with fallback on storage failures

### 2. Enhanced Drag & Drop

- Real-time haptic feedback
- Persistent storage of reorder operations
- Automatic conflict resolution
- Background saves with progress indicators

### 3. Status Management

- Maintains order consistency across status changes
- Intelligent placement of newly enabled activities
- Clean removal of deleted activities from storage

## Architecture

### Storage Classes

#### `BaseStorage`

Base class providing common AsyncStorage patterns:

- Error handling and logging
- Namespaced keys
- Generic CRUD operations
- Bulk operations support

#### `ActivityOrderStorage`

Manages activity ordering:

```typescript
// Save complete activity order
await activityOrderStorage.saveOrder(activities, preserveDisabledOrder);

// Get current stored order
const { data: order } = await activityOrderStorage.getOrder();

// Sort activities by stored order
const sorted = activityOrderStorage.sortActivitiesByStoredOrder(
  activities,
  order
);

// Handle reorder operations
const result = await activityOrderStorage.reorderActivity(
  activities,
  operation
);

// Handle status changes
await activityOrderStorage.updateActivityStatus(activities, id, "DISABLED");
```

#### `ActivityPreferencesStorage`

Manages user preferences:

```typescript
// Get preferences with defaults
const { data: prefs } = await activityPreferencesStorage.getPreferences();

// Update specific preference
await activityPreferencesStorage.updatePreference("defaultGridColumns", 6);

// Add recently used color
await activityPreferencesStorage.addRecentColor("#FF6B6B");
```

### Store Integration

The `useActivitiesStore` now includes enhanced methods:

```typescript
// Enhanced order management
await updateActivityOrder(activities); // Saves to storage + updates state
await reorderActivity(operation); // Handles single reorder operations
await loadStoredOrder(); // Loads and applies stored order

// Status changes maintain order
await disableActivity(id); // Maintains position for re-enabling
await enableActivity(id); // Restores to stored position
await softDeleteActivity(id); // Removes from storage
```

### Hooks Integration

#### `useActivityManagement`

Combined hook providing grid calculations, drag operations, and storage:

```typescript
const {
  // Grid calculations
  gridProperties,
  enabledActivities,
  disabledActivities,

  // Drag operations
  activityOrder,
  draggedActivityId,
  handleDragStart,
  handleReorder,

  // Activity management
  handleDeleteActivity,
  handleEnableActivity,
  isSavingOrder,
} = useActivityManagement({
  activities,
  gridConfig,
  includeAddButton: true,
  onDragStateChange,
});
```

#### `useDragOperations` (Enhanced)

Now includes persistent storage:

```typescript
const handleReorder = useCallback(
  async (fromIndex: number, toIndex: number) => {
    // Optimistic UI update
    setActivityOrder(newOrder);

    // Persistent storage
    const success = await reorderActivity(operation);

    // Revert on failure
    if (!success) {
      setActivityOrder(originalOrder);
    }
  },
  [reorderActivity]
);
```

## Migration Guide

### From Old System

The old `activityOrderStorage.ts` file now acts as a compatibility layer:

```typescript
// Old way (still works)
import { saveActivityOrderToStorage } from "@/shared/utils/activityOrderStorage";

// New way (recommended)
import { activityOrderStorage } from "@/shared/storage/activities";
await activityOrderStorage.saveOrder(activities);
```

### Component Updates

#### Before:

```typescript
const [activityOrder, setActivityOrder] = useState(activities);

const handleReorder = (fromIndex, toIndex) => {
  const newOrder = [...activityOrder];
  // manual reorder logic
  setActivityOrder(newOrder);
  // manual storage save
};
```

#### After:

```typescript
const { activityOrder, handleReorder, isSavingOrder } = useActivityManagement({
  activities,
  gridConfig,
  onDragStateChange,
});

// handleReorder automatically handles storage and state updates
```

## Storage Keys

All storage keys are centralized in `shared/storage/types.ts`:

```typescript
export const STORAGE_KEYS = {
  // Activity-related
  ACTIVITY_ORDER: "activity_order",
  ACTIVITY_PREFERENCES: "activity_preferences",
  ACTIVITY_USAGE_STATS: "activity_usage_stats",

  // UI-related
  UI_THEME: "ui_theme",
  UI_GRID_CONFIG: "ui_grid_config",
  UI_LAYOUT_PREFERENCES: "ui_layout_preferences",

  // User-related
  USER_PROFILE: "user_profile",
  USER_SETTINGS: "user_settings",
  USER_ONBOARDING: "user_onboarding",
} as const;
```

## Data Structures

### ActivityOrder

```typescript
interface ActivityOrder {
  enabled: string[]; // IDs in desired order
  disabled: string[]; // IDs of disabled activities
  lastUpdated: string; // ISO timestamp
}
```

### ActivityReorderOperation

```typescript
interface ActivityReorderOperation {
  fromIndex: number; // Source position
  toIndex: number; // Target position
  activityId: string; // ID of moved activity
}
```

## Error Handling

All storage operations include comprehensive error handling:

- Automatic logging via `GlobalErrorHandler`
- Graceful degradation on storage failures
- Optimistic updates with rollback capability
- User feedback via haptic notifications

## Performance Optimizations

1. **Memoized Calculations**: Grid calculations are memoized based on activity count and config
2. **Batched Updates**: Multiple reorder operations are batched where possible
3. **Background Saves**: Storage operations don't block UI interactions
4. **Efficient Sorting**: O(n) sorting algorithm using hash maps
5. **Lazy Loading**: Order is loaded only when needed

## Future Enhancements

1. **Activity Usage Stats**: Track usage patterns for intelligent ordering
2. **Cross-Device Sync**: Synchronize order across multiple devices
3. **Bulk Operations**: Efficient handling of multiple activity changes
4. **Undo/Redo**: History tracking for order changes
5. **Smart Suggestions**: AI-powered activity ordering suggestions

## Testing

Storage operations should be tested with:

1. **Unit Tests**: Individual storage methods
2. **Integration Tests**: Store + storage interactions
3. **E2E Tests**: Complete user workflows
4. **Performance Tests**: Large activity lists
5. **Error Recovery Tests**: Storage failure scenarios

## Best Practices

1. Always use the store methods rather than direct storage access
2. Handle storage failures gracefully with user feedback
3. Use optimistic updates for immediate UI responsiveness
4. Batch operations when possible to reduce storage calls
5. Test with storage failures to ensure robust error handling
