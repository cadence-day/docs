# Zustand Store Utilities

Utilities for creating consistent, maintainable Zustand stores with standardized error handling, loading states, and API call patterns.

## Directory Structure

```
shared/stores/
├── utils/
│   ├── utils.ts           # Core store utilities
│   └── errorHandler.ts    # Error handling utilities
└── resources/
  ├── useNotesStore.ts
  ├── useStatesStore.ts
  ├── useTimeslicesStore.ts
  ├── useActivitiesStore.ts
  └── useActivityCategoriesStore.ts
```

## Core Concepts

### Utility Functions

- **handleApiCall**: Generic API handler with state update
- **handleGetApiCall**: For GET operations (no state update)
- **handleVoidApiCall**: For void operations (e.g., delete)
- **handleVoidApiCallWithResult**: For custom result processing

### Error Handling

- **extractErrorMessage**: Safely extracts error messages
- **createErrorState**: Standardized error state
- **createLoadingState**: Loading state with error reset
- **createSuccessState**: Success state

## Store Patterns

- **CRUD**: insertX, updateX, deleteX, upsertX
- **Get**: getX(id), getXs(ids), getUserXs(userId), getAllXs()
- **Refresh**: refresh(userId) merges remote/local state

## Usage in Components

```tsx
import useActivitiesStore from "@/shared/stores/useActivitiesStore";

export function ActivitiesList() {
  const { activities, isLoading, error, refresh } = useActivitiesStore();
  useEffect(() => {
    refresh();
  }, [refresh]);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div>
      {activities.map((activity) => (
        <div key={activity.id}>{activity.name}</div>
      ))}
    </div>
  );
}
```

## Best Practices

- Always extend `BaseStoreState`
- Use descriptive operation names
- Keep state updates pure and focused
- Choose appropriate default values
- Centralize error and loading state management

## Benefits

- **Consistency**: Identical patterns across stores
- **Type Safety**: Full TypeScript support
- **Error Handling**: Centralized and predictable
- **Reduced Boilerplate**: Less repetitive code
- **Better UX**: Automatic loading/error states
- **Testability**: Utilities are independently testable

## Migration

1. Extend `BaseStoreState`
2. Replace manual error/loading logic with utilities
3. Refactor operations to use handlers
