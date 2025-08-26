# Zustand Store Utilities

This directory contains a comprehensive set of utilities for creating consistent and maintainable Zustand stores with standardized error handling, loading states, and API call patterns.

## Architecture Overview

# Zustand Store Utilities

Comprehensive utilities for creating consistent and maintainable Zustand stores with standardized error handling, loading states, and API call patterns.

## Architecture

```
shared/stores/
├── utils/
│   ├── utils.ts           # Core store utilities
│   └── errorHandler.ts    # Error handling utilities
└── resources/
    ├── index.ts           # Resource store exports
    ├── useNotesStore.ts   # Notes management store
    ├── useStatesStore.ts  # States management store
    ├── useTimeslicesStore.ts # Timeslices management store
    ├── useActivitiesStore.ts # Activities management store
    └── useActivityCategoriesStore.ts # Activity categories store
```

## Core Components

### Base Store Interface

```typescript
interface BaseStoreState {
  isLoading: boolean;
  error: string | null;
}
```

### API Call Handlers

- **`handleApiCall`** - Generic handler for API calls that return data and update state
- **`handleGetApiCall`** - Simplified handler for GET operations (no state updates)
- **`handleVoidApiCall`** - Handler for void operations (like delete) that update state
- **`handleVoidApiCallWithResult`** - Handler for operations with custom result processing

### Error Management

- **`createErrorState`** - Creates standardized error state objects
- **`createLoadingState`** - Creates loading state with error reset
- **`createSuccessState`** - Creates success state (loading: false)

## Usage Example

```typescript
import { create } from "zustand";
import { handleApiCall, type BaseStoreState } from "../utils/utils";
import * as api from "@/shared/api/resources/myResource";

interface MyStore extends BaseStoreState {
  items: Item[];
  addItem: (item: Omit<Item, "id">) => Promise<Item | null>;
  deleteItem: (id: string) => Promise<void>;
}

const useMyStore = create<MyStore>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  addItem: async (item) => {
    return handleApiCall(
      set,
      () => api.createItem(item),
      "create item",
      null,
      (newItem, state) =>
        newItem
          ? {
              items: [...state.items, newItem],
            }
          : {}
    );
  },

  deleteItem: async (id) => {
    return handleVoidApiCall(
      set,
      () => api.deleteItem(id),
      "delete item",
      (state) => ({
        items: state.items.filter((item) => item.id !== id),
      })
    );
  },
}));
```

## Store Patterns

### CRUD Operations

All resource stores follow consistent patterns:

- **Insert**: `insertX` / `insertXs` with optimistic state updates
- **Update**: `updateX` with state synchronization
- **Delete**: `deleteX` / `deleteXs` with state filtering
- **Upsert**: `upsertX` / `upsertXs` with smart insert/update logic

### Get Operations

- **Individual**: `getX(id)` - Returns single item without state update
- **Multiple**: `getXs(ids)` - Returns array without state update
- **User-scoped**: `getUserXs(userId)` - Returns user's items
- **Global**: `getAllXs()` - Returns all items (where applicable)

### Refresh Operations

- **`refresh(userId)`** - Fetches fresh data and updates store state
- Merges remote data with local state intelligently

## Available Stores

- **`useNotesStore`** - Note creation, editing, deletion with encryption support
- **`useStatesStore`** - User state tracking with mood/energy data
- **`useTimeslicesStore`** - Time-based activity tracking
- **`useActivitiesStore`** - Activity management with categories and ordering
- **`useActivityCategoriesStore`** - Read-only activity category reference data

## Benefits

1. **Consistency** - All stores follow identical patterns
2. **Type Safety** - Full TypeScript support with generics
3. **Error Handling** - Centralized, consistent error management
4. **Loading States** - Automatic loading state management
5. **Reduced Boilerplate** - 90% reduction in repetitive code
6. **Optimistic Updates** - Immediate UI feedback with rollback support

## Core Components

### 1. Error Handler (`errorHandler.ts`)

Provides centralized error handling utilities for consistent error processing across all stores.

#### Functions:

- **`extractErrorMessage(error: unknown, operationName: string): string`**
  - Safely extracts error messages from various error types
  - Handles `Error` instances, strings, and unknown types
  - Returns fallback message for unknown errors

- **`createErrorState(error: unknown, operationName: string)`**
  - Creates standardized error state objects
  - Sets `isLoading: false` and appropriate error message

- **`createLoadingState()`**
  - Creates standardized loading state
  - Sets `isLoading: true, error: null`

- **`createSuccessState()`**
  - Creates standardized success state
  - Sets `isLoading: false`

### 2. Store Utilities (`utils.ts`)

Provides generic utility functions for handling API calls with consistent patterns.

#### Types:

- **`BaseStoreState`** - Interface that all stores should extend
  ```typescript
  interface BaseStoreState {
    isLoading: boolean;
    error: string | null;
  }
  ```

#### Functions:

- **`handleApiCall<T, S>(set, apiCall, operationName, defaultReturnValue, stateUpdater?)`**
  - Generic handler for API calls that return data
  - Manages loading states and error handling
  - Optionally updates local state with returned data
  - Returns the API result or default value on error

- **`handleGetApiCall<T, S>(set, apiCall, operationName, defaultReturnValue)`**
  - Simplified handler for GET operations
  - Doesn't modify local state, just returns data
  - Perfect for fetch operations that don't update store state

- **`handleVoidApiCall<S>(set, apiCall, operationName, stateUpdater)`**
  - Handler for operations that return void
  - Updates local state based on success
  - Perfect for delete, disable operations

- **`handleVoidApiCallWithResult<T, S>(set, apiCall, operationName, stateUpdater)`**
  - Handler for operations that process results but return void
  - Useful for operations like refresh that need custom processing

## Usage Examples

### Basic Store Setup

```typescript
import { create } from "zustand";
import { handleApiCall, handleGetApiCall, type BaseStoreState } from "./utils";
import * as api from "@/shared/api/resources/myResource";

interface MyStore extends BaseStoreState {
  items: Item[];

  // Operations
  getItem: (id: string) => Promise<Item | null>;
  addItem: (item: Omit<Item, "id">) => Promise<Item | null>;
  deleteItem: (id: string) => Promise<void>;
}

const useMyStore = create<MyStore>((set) => ({
  // Initial state
  items: [],
  isLoading: false,
  error: null,

  // Get operation (doesn't modify state)
  getItem: async (id: string) => {
    return handleGetApiCall(set, () => api.getItem(id), "get item", null);
  },

  // Add operation (updates state)
  addItem: async (item: Omit<Item, "id">) => {
    return handleApiCall(
      set,
      () => api.createItem(item),
      "create item",
      null,
      (newItem, state) =>
        newItem
          ? {
              items: [...state.items, newItem],
            }
          : {}
    );
  },

  // Delete operation (void return)
  deleteItem: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => api.deleteItem(id),
      "delete item",
      (state) => ({
        items: state.items.filter((item) => item.id !== id),
      })
    );
  },
}));
```

### Real-World Example: Activities Store

Here's how the utilities are used in the actual `useActivitiesStore`:

```typescript
import { create } from "zustand";
import type { Activity } from "@/shared/types/models";
import * as activitiesApi from "@/shared/api/resources/activities";
import {
  handleApiCall,
  handleGetApiCall,
  handleVoidApiCall,
  handleVoidApiCallWithResult,
  type BaseStoreState,
} from "./utils";

interface ActivitiesStore extends BaseStoreState {
  activities: Activity[];

  // CRUD operations
  insertActivity: (activity: Omit<Activity, "id">) => Promise<Activity | null>;
  updateActivity: (activity: Activity) => Promise<Activity | null>;
  softDeleteActivity: (id: string) => Promise<void>;
  disableActivity: (id: string) => Promise<void>;

  // Bulk operations
  insertActivities: (activities: Omit<Activity, "id">[]) => Promise<Activity[]>;
  softDeleteActivities: (ids: string[]) => Promise<void>;

  // Get operations
  getActivity: (id: string) => Promise<Activity | null>;
  getAllActivities: () => Promise<Activity[]>;

  // Complex operations
  refresh: () => Promise<void>;
  updateActivityOrder: (reorderedActivities: Activity[]) => void;
}

const useActivitiesStore = create<ActivitiesStore>((set) => ({
  // Initial state
  activities: [],
  isLoading: false,
  error: null,

  // Simple CRUD with state updates
  insertActivity: async (activity: Omit<Activity, "id">) => {
    return handleApiCall(
      set,
      () => activitiesApi.insertActivity(activity),
      "create activity",
      null,
      (newActivity, state) =>
        newActivity
          ? {
              activities: [...state.activities, newActivity],
            }
          : {}
    );
  },

  updateActivity: async (activity: Activity) => {
    return handleApiCall(
      set,
      () => activitiesApi.updateActivity(activity),
      "update activity",
      null,
      (updatedActivity, state) =>
        updatedActivity
          ? {
              activities: state.activities.map((a) =>
                a.id === updatedActivity.id ? updatedActivity : a
              ),
            }
          : {}
    );
  },

  // Void operations that modify state
  softDeleteActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.softDeleteActivity(id),
      "delete activity",
      (state) => ({
        activities: state.activities.filter((a) => a.id !== id),
      })
    );
  },

  disableActivity: async (id: string) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.disableActivity(id),
      "disable activity",
      (state) => ({
        activities: state.activities.map((a) =>
          a.id === id ? { ...a, status: "DISABLED" } : a
        ),
      })
    );
  },

  // Bulk operations
  insertActivities: async (activities: Omit<Activity, "id">[]) => {
    return handleApiCall(
      set,
      () => activitiesApi.insertActivities(activities),
      "create activities",
      [],
      (newActivities, state) =>
        newActivities.length > 0
          ? {
              activities: [...state.activities, ...newActivities],
            }
          : {}
    );
  },

  softDeleteActivities: async (ids: string[]) => {
    return handleVoidApiCall(
      set,
      () => activitiesApi.softDeleteActivities(ids),
      "delete activities",
      (state) => ({
        activities: state.activities.filter((a) => !ids.includes(a.id!)),
      })
    );
  },

  // Get operations (no state updates)
  getActivity: async (id: string) => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getActivity(id),
      "get activity",
      null
    );
  },

  getAllActivities: async () => {
    return handleGetApiCall(
      set,
      () => activitiesApi.getAllActivities(),
      "get all activities",
      []
    );
  },

  // Complex operation with custom processing
  refresh: async () => {
    return handleVoidApiCallWithResult(
      set,
      async () => {
        // Fetch enabled activities from remote database
        const activities = await activitiesApi.getAllEnabledActivities();

        // Load and sort activities with stored order
        const storedOrder = await loadActivityOrderFromStorage();
        return sortActivitiesByStoredOrder(activities, storedOrder);
      },
      "refresh activities",
      (sortedActivities) => ({
        activities: sortedActivities,
      })
    );
  },

  // Local-only operation (no API call)
  updateActivityOrder: async (reorderedActivities: Activity[]) => {
    try {
      await saveActivityOrderToStorage(reorderedActivities);
      set({ activities: reorderedActivities });
    } catch (error) {
      console.error("Failed to save activity order:", error);
      // Still update the state even if storage fails
      set({ activities: reorderedActivities });
    }
  },
}));
```

#### Key Patterns Demonstrated:

1. **State Updates**: How to update local state based on API results
2. **Bulk Operations**: Handling multiple items efficiently
3. **Void Operations**: Operations that don't return data but modify state
4. **Get Operations**: Read-only operations that don't modify store state
5. **Complex Processing**: Custom logic with `handleVoidApiCallWithResult`
6. **Error Handling**: Automatic error management across all operations

### Simpler Example: Activity Categories Store

Here's a simpler store that only handles read operations for activity categories:

```typescript
import { create } from "zustand";
import type { ActivityCategory } from "@/shared/types/models";
import * as activitiesCategoriesApi from "@/shared/api/resources/activitiesCategories";
import {
  handleGetApiCall,
  handleVoidApiCallWithResult,
  type BaseStoreState,
} from "./utils";

interface ActivityCategoriesStore extends BaseStoreState {
  // State
  categories: ActivityCategory[];

  // Operations
  getAllCategories: () => Promise<ActivityCategory[]>;
  refresh: () => Promise<void>;

  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const useActivityCategoriesStore = create<ActivityCategoriesStore>((set) => ({
  // Initial state
  categories: [],
  isLoading: false,
  error: null,

  // Get operations (doesn't modify store state)
  getAllCategories: async () => {
    return handleGetApiCall(
      set,
      () => activitiesCategoriesApi.getAllActivityCategories(),
      "get all activity categories",
      []
    );
  },

  // Refresh operation (updates store state)
  refresh: async () => {
    return handleVoidApiCallWithResult(
      set,
      () => activitiesCategoriesApi.getAllActivityCategories(),
      "refresh activity categories",
      (categories) => ({
        categories,
      })
    );
  },

  // Utility functions
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  reset: () => set({ categories: [], isLoading: false, error: null }),
}));
```

#### Usage in Components:

```tsx
import React, { useEffect } from "react";
import useActivityCategoriesStore from "@/shared/stores/useActivityCategoriesStore";

export function CategoriesDropdown() {
  const { categories, isLoading, error, refresh } =
    useActivityCategoriesStore();

  useEffect(() => {
    // Load categories when component mounts
    refresh();
  }, [refresh]);

  if (isLoading) {
    return (
      <select disabled>
        <option>Loading...</option>
      </select>
    );
  }

  if (error) {
    return <div>Error loading categories: {error}</div>;
  }

  return (
    <select>
      <option value="">Select a category</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

// Or for just fetching without storing in the store
export function CategoryList() {
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const { getAllCategories, isLoading, error } = useActivityCategoriesStore();

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getAllCategories();
      setCategories(result);
    };

    fetchCategories();
  }, [getAllCategories]);

  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}
```

#### Key Differences from Activities Store:

1. **Read-Only**: Only has get and refresh operations (no CRUD)
2. **Simpler State**: Just categories array with standard loading/error states
3. **Two Access Patterns**:
   - `getAllCategories()` - Returns data without storing in state
   - `refresh()` - Fetches data and updates store state
4. **Perfect for**: Dropdowns, reference data, lookups

### Using the Activities Store in Components

Here are practical examples of how to use `useActivitiesStore` in React components:

#### Basic Usage - Displaying Activities

```tsx
import React, { useEffect } from "react";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";

export function ActivitiesList() {
  const { activities, isLoading, error, refresh } = useActivitiesStore();

  useEffect(() => {
    // Load activities when component mounts
    refresh();
  }, [refresh]);

  if (isLoading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Activities ({activities.length})</h2>
      {activities.map((activity) => (
        <div key={activity.id}>
          <h3>{activity.name}</h3>
          <p>Status: {activity.status}</p>
        </div>
      ))}
    </div>
  );
}
```

#### Creating New Activities

```tsx
import React, { useState } from "react";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";

export function CreateActivityForm() {
  const [name, setName] = useState("");
  const { insertActivity, isLoading, error } = useActivitiesStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newActivity = await insertActivity({
      name,
      status: "ENABLED",
      user_id: "current-user-id",
      // ... other required fields
    });

    if (newActivity) {
      setName(""); // Clear form on success
      console.log("Activity created:", newActivity);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Activity Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Activity"}
      </button>

      {error && <div style={{ color: "red" }}>Error: {error}</div>}
    </form>
  );
}
```

#### Managing Individual Activities

```tsx
import React from "react";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";
import type { Activity } from "@/shared/types/models";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { updateActivity, softDeleteActivity, disableActivity, isLoading } =
    useActivitiesStore();

  const handleToggleStatus = async () => {
    if (activity.status === "ENABLED") {
      await disableActivity(activity.id!);
    } else {
      await updateActivity({
        ...activity,
        status: "ENABLED",
      });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this activity?")) {
      await softDeleteActivity(activity.id!);
    }
  };

  const handleRename = async () => {
    const newName = prompt("Enter new name:", activity.name || "");
    if (newName && newName !== activity.name) {
      await updateActivity({
        ...activity,
        name: newName,
      });
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        margin: "0.5rem",
        opacity: activity.status === "DISABLED" ? 0.5 : 1,
      }}
    >
      <h3>{activity.name}</h3>
      <p>Status: {activity.status}</p>

      <div>
        <button onClick={handleRename} disabled={isLoading}>
          Rename
        </button>

        <button onClick={handleToggleStatus} disabled={isLoading}>
          {activity.status === "ENABLED" ? "Disable" : "Enable"}
        </button>

        <button
          onClick={handleDelete}
          disabled={isLoading}
          style={{ color: "red" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
```

#### Bulk Operations

```tsx
import React, { useState } from "react";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";

export function BulkActivityManager() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const {
    activities,
    softDeleteActivities,
    disableActivities,
    insertActivities,
    isLoading,
  } = useActivitiesStore();

  const handleSelectAll = () => {
    setSelectedIds(activities.map((a) => a.id!));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      await softDeleteActivities(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length > 0) {
      await disableActivities(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleCreateMultiple = async () => {
    const newActivities = [
      { name: "Morning Run", status: "ENABLED" as const, user_id: "user-1" },
      {
        name: "Evening Workout",
        status: "ENABLED" as const,
        user_id: "user-1",
      },
      { name: "Meditation", status: "ENABLED" as const, user_id: "user-1" },
    ];

    await insertActivities(newActivities);
  };

  return (
    <div>
      <div>
        <button onClick={handleSelectAll}>Select All</button>
        <button onClick={handleDeselectAll}>Deselect All</button>
        <button onClick={handleCreateMultiple} disabled={isLoading}>
          Create Sample Activities
        </button>
      </div>

      <div>
        <button
          onClick={handleBulkDisable}
          disabled={selectedIds.length === 0 || isLoading}
        >
          Disable Selected ({selectedIds.length})
        </button>

        <button
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0 || isLoading}
          style={{ color: "red" }}
        >
          Delete Selected ({selectedIds.length})
        </button>
      </div>

      <div>
        {activities.map((activity) => (
          <label key={activity.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedIds.includes(activity.id!)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds([...selectedIds, activity.id!]);
                } else {
                  setSelectedIds(
                    selectedIds.filter((id) => id !== activity.id)
                  );
                }
              }}
            />
            {activity.name} ({activity.status})
          </label>
        ))}
      </div>
    </div>
  );
}
```

#### Advanced Usage - Custom Hooks

```tsx
// Custom hook for activity management
import { useCallback } from "react";
import useActivitiesStore from "@/shared/stores/useActivitiesStore";

export function useActivityManager() {
  const store = useActivitiesStore();

  const createActivity = useCallback(
    async (name: string) => {
      return store.insertActivity({
        name,
        status: "ENABLED",
        user_id: "current-user-id",
        // Add other default values
      });
    },
    [store.insertActivity]
  );

  const toggleActivityStatus = useCallback(
    async (activityId: string) => {
      const activity = store.activities.find((a) => a.id === activityId);
      if (!activity) return;

      if (activity.status === "ENABLED") {
        await store.disableActivity(activityId);
      } else {
        await store.updateActivity({
          ...activity,
          status: "ENABLED",
        });
      }
    },
    [store.activities, store.disableActivity, store.updateActivity]
  );

  const getEnabledActivities = useCallback(() => {
    return store.activities.filter((a) => a.status === "ENABLED");
  }, [store.activities]);

  return {
    ...store,
    createActivity,
    toggleActivityStatus,
    getEnabledActivities,
  };
}

// Usage in component
export function ActivityManager() {
  const {
    activities,
    isLoading,
    error,
    createActivity,
    toggleActivityStatus,
    getEnabledActivities,
  } = useActivityManager();

  const enabledActivities = getEnabledActivities();

  return (
    <div>
      <p>
        Total: {activities.length}, Enabled: {enabledActivities.length}
      </p>
      {/* Rest of component */}
    </div>
  );
}
```

#### Key Usage Patterns:

1. **State Subscription**: Use destructuring to get only the state you need
2. **Loading States**: Always check `isLoading` for better UX
3. **Error Handling**: Display errors to users appropriately
4. **Optimistic Updates**: State updates automatically after successful operations
5. **Bulk Operations**: Use array methods for multiple items
6. **Custom Hooks**: Create abstractions for complex operations

### Error Handling

All utility functions automatically handle errors using the centralized error handler:

```typescript
// Automatic error handling
const result = await handleApiCall(
  set,
  () => someApiCall(),
  "perform operation", // Used in error message if operation fails
  defaultValue,
  stateUpdater
);

// Error states are automatically set:
// - isLoading: false
// - error: "Failed to perform operation" (or actual error message)
```

### Loading States

Loading states are automatically managed:

```typescript
// Before API call: { isLoading: true, error: null }
// After success: { isLoading: false }
// After error: { isLoading: false, error: "..." }
```

## Best Practices

### 1. Store Interface Design

Always extend `BaseStoreState` for consistent error and loading handling:

```typescript
interface MyStore extends BaseStoreState {
  // Your store-specific state
  data: MyData[];

  // Your operations
  fetchData: () => Promise<void>;
}
```

### 2. Operation Naming

Use descriptive operation names for better error messages:

```typescript
// Good
handleApiCall(set, apiCall, "fetch user profile", defaultValue);

// Bad
handleApiCall(set, apiCall, "fetch", defaultValue);
```

### 3. State Updates

Keep state update logic focused and pure:

```typescript
// Good - clear and focused
(newItem, state) => newItem ? {
  items: [...state.items, newItem],
} : {}

// Avoid - complex logic in state updater
(result, state) => {
  // Complex processing...
  return complexStateUpdate;
}
```

### 4. Default Values

Choose appropriate default values based on operation type:

```typescript
// Single item operations
handleGetApiCall(set, apiCall, "get item", null);

// Array operations
handleGetApiCall(set, apiCall, "get items", []);

// Void operations
handleVoidApiCall(set, apiCall, "delete item", stateUpdater);
```

## Benefits

1. **Consistency** - All stores follow the same patterns
2. **Maintainability** - Error handling and loading logic centralized
3. **Type Safety** - Full TypeScript support with generics
4. **Reduced Boilerplate** - 90% reduction in repetitive code
5. **Better UX** - Consistent loading and error states
6. **Testability** - Utilities can be tested independently

## Migration Guide

To migrate existing stores to use these utilities:

1. **Update interface** to extend `BaseStoreState`
2. **Replace manual error handling** with utility functions
3. **Update operation implementations** to use appropriate handlers
4. **Remove redundant loading state management**

### Before:

```typescript
fetchData: async () => {
  set({ isLoading: true, error: null });
  try {
    const data = await api.fetchData();
    set({ data, isLoading: false });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : "Failed to fetch data",
      isLoading: false,
    });
  }
};
```

### After:

```typescript
fetchData: async () => {
  return handleVoidApiCallWithResult(
    set,
    () => api.fetchData(),
    "fetch data",
    (data) => ({ data })
  );
};
```

## Error Handling Details

The error handler provides robust error processing:

- **Error Instances**: Extracts `.message` property
- **String Errors**: Uses string directly
- **Unknown Types**: Provides fallback message
- **Consistent Format**: All errors follow same pattern

This ensures your application has predictable error handling across all store operations.
