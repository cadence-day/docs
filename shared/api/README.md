# API Layer

This folder contains the API layer for the Cadence.day mobile app, providing a centralized and type-safe interface to interact with the Supabase backend.

## Architecture Overview

The API layer follows a modular, resource-based organization with the following key principles:

- **Type Safety**: Full TypeScript support with generated database types
- **Error Handling**: Centralized error handling with retry logic
- **Caching**: Built-in caching system for performance optimization
- **Authentication**: Integrated with Clerk for session management
- **Modularity**: Each resource (activities, notes, etc.) has its own module

## Folder Structure

```
api/
├── README.md                    # This file
├── index.ts                     # Main entry point, exports all API functions
├── client/                      # Supabase client configuration
│   ├── supabaseClient.ts        # Authenticated Supabase client setup
│   └── supabaseClient.test.ts   # Client tests
├── utils/                       # Shared utilities
│   ├── apiHelpers.ts            # Core API utilities and wrapper functions
│   ├── cache.ts                 # In-memory caching system
│   └── errorHandler.ts          # Error handling and retry logic
└── [resources]/                 # Resource-specific API modules
    ├── activities/              # Activity CRUD operations
    ├── activitiesCategories/    # Activity categories operations
    ├── notes/                   # Notes CRUD operations
    ├── states/                  # States CRUD operations
    └── timeslices/              # Timeslices CRUD operations
```

### Resource Module Structure

Each resource module follows a consistent pattern:

```
[resource]/
├── index.ts      # Exports all operations for the resource
├── get.ts        # Read operations
├── insert.ts     # Create operations
├── update.ts     # Update operations
└── delete.ts     # Delete operations
```

## Key Components

### 1. Supabase Client (`client/supabaseClient.ts`)

Provides an authenticated Supabase client integrated with Clerk for session management:

```typescript
import { supabaseClient } from '@/shared/api';

// The client automatically includes the user's auth token
const { data, error } = await supabaseClient
  .from('activities')
  .select('*');
```

### 2. API Helpers (`utils/apiHelpers.ts`)

Core utilities for API operations:

- **`apiCall()`**: Wrapper function with caching, retry logic, and date conversion
- **Date Conversion**: Automatic conversion between UTC and local dates
- **Error Handling**: Standardized error processing

```typescript
import { apiCall } from '@/shared/api/utils/apiHelpers';

// Example usage with caching
const result = await apiCall(
  () => supabaseClient.from('activities').select('*'),
  { 
    useCache: true, 
    cacheKey: 'user_activities',
    cacheTtl: 300000 // 5 minutes
  }
);
```

### 3. Error Handling (`utils/errorHandler.ts`)

Centralized error handling with:

- **Retry Logic**: Automatic retries for transient errors
- **Error Classification**: Distinguishes between retryable and non-retryable errors
- **Exponential Backoff**: Smart delay strategy for retries

### 4. Caching System (`utils/cache.ts`)

In-memory caching with TTL support:

- **TTL Support**: Automatic cache expiration
- **Pattern Invalidation**: Bulk cache invalidation by pattern
- **Cache Key Builders**: Standardized cache key generation

## Usage Examples

### Basic CRUD Operations

```typescript
import { 
  getActivity, 
  getEnabledUserActivities,
  insertActivity,
  updateActivity,
  deleteActivity 
} from '@/shared/api';

// Fetch a single activity
const activity = await getActivity('activity-id');

// Fetch user's enabled activities
const userActivities = await getEnabledUserActivities('user-id');

// Create a new activity
const newActivity = await insertActivity({
  name: 'Reading',
  user_id: 'user-id',
  category_id: 'category-id'
});

// Update an activity
const updatedActivity = await updateActivity('activity-id', {
  name: 'Updated Reading'
});

// Delete an activity (soft delete)
await deleteActivity('activity-id');
```

### Using Caching

```typescript
import { apiCall, buildCacheKey } from '@/shared/api/utils/apiHelpers';

// Manual caching with apiCall
const activities = await apiCall(
  () => supabaseClient.from('activities').select('*'),
  {
    useCache: true,
    cacheKey: buildCacheKey.userActivities(userId),
    cacheTtl: 300000 // 5 minutes
  }
);
```

### Error Handling

```typescript
import { handleApiError, ApiError } from '@/shared/api/utils/errorHandler';

try {
  const result = await getActivity('invalid-id');
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Context:', error.context);
    console.log('Retryable:', error.isRetryable);
  }
}
```

## Adding New Resources

To add a new resource (e.g., `comments`):

1. **Create the resource folder**:
   ```
   mkdir api/comments
   ```

2. **Create the CRUD files**:
   ```typescript
   // api/comments/get.ts
   export async function getComment(id: string): Promise<Comment | null> {
     return await apiCall(async () => {
       const { data, error } = await supabaseClient
         .from('comments')
         .select('*')
         .eq('id', id)
         .single();
       return { data, error };
     });
   }
   ```

3. **Create the index file**:
   ```typescript
   // api/comments/index.ts
   export * from './get';
   export * from './insert';
   export * from './update';
   export * from './delete';
   ```

4. **Export from main index**:
   ```typescript
   // api/index.ts
   export * from './comments';
   ```

## Best Practices

### 1. Error Handling
- Always use `apiCall()` wrapper for Supabase operations
- Handle errors gracefully with try-catch blocks
- Use context-specific error messages

### 2. Type Safety
- Import types from `@/shared/types/models`
- Use the generated `Database` type for Supabase operations
- Ensure return types match the expected model types

### 3. Caching
- Use caching for frequently accessed, relatively static data
- Choose appropriate TTL values based on data freshness requirements
- Invalidate cache when data is modified

### 4. Function Naming
- Use descriptive function names (e.g., `getEnabledUserActivities`)
- Follow the pattern: `[action][Entity][OptionalQualifier]`
- Be consistent across similar operations

### 5. Performance
- Use selective queries (avoid `SELECT *` when possible)
- Implement pagination for large datasets
- Consider using Supabase's built-in filtering and sorting

## Environment Integration

The API layer integrates with:

- **Supabase**: Database and real-time operations
- **Clerk**: Authentication and session management
- **TypeScript**: Full type safety with generated database types
- **Doppler**: Environment variable management

## Testing

Each resource should include tests for:
- CRUD operations
- Error scenarios
- Edge cases
- Authentication requirements

See `client/supabaseClient.test.ts` for testing patterns.

## Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Project Environment Setup](../../docs/ENVIRONMENT_SETUP.md)
- [Database Types](../types/database.types.ts)
