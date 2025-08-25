# API Layer

This folder contains the API layer for the Cadence.day mobile app, providing a centralized and type-safe interface to interact with the Supabase backend.

## Architecture Overview

The API layer follows a modular, resource-based organization with the following key principles:

- **Type Safety**: Full TypeScript support with generated database types
- **Error Handling**: Centralized error handling with retry logic and exponential backoff
- **Caching**: In-memory caching system with TTL support for performance optimization
- **Authentication**: Seamlessly integrated with Clerk for automatic session management
- **Modularity**: Each database resource has its own dedicated module with consistent CRUD operations
- **Date Handling**: Automatic conversion between UTC and local dates
- **Real-time**: Built on Supabase for real-time data synchronization

## Folder Structure

```
api/
├── index.ts                     # Main entry point, exports all API functions
├── client/                      # Supabase client configuration
│   ├── supabaseClient.ts        # Authenticated Supabase client setup
│   └── supabaseClient.test.ts   # Client tests
├── utils/                       # Shared utilities
│   ├── apiHelpers.ts            # Core API utilities and wrapper functions
│   ├── cache.ts                 # In-memory caching system
│   └── errorHandler.ts          # Error handling and retry logic
└── resources/                   # Resource-specific API modules
    ├── activities/              # Activity CRUD operations
    ├── activitiesCategories/    # Activity categories operations
    ├── notes/                   # Notes CRUD operations
    ├── states/                  # States CRUD operations
    └── timeslices/              # Timeslices CRUD operations
```

## Key Components

### 1. Supabase Client (`client/supabaseClient.ts`)

Provides an authenticated Supabase client that automatically includes user auth tokens from Clerk sessions.

### 2. Centralized API handling functions in `utils/`

- Includes core utilities such as the `apiCall()` wrapper function with built-in caching, retry logic, and automatic date conversion between UTC and local timezones.
- Includes standardized error handling and logging mechanisms.

## Resource Organization

Each resource module in `resources/` follows a consistent structure:

- `get.ts` - Read operations and queries
- `insert.ts` - Create operations
- `update.ts` - Update operations
- `delete.ts` - Delete operations (typically soft deletes)
- `index.ts` - Exports all operations for the resource

Available resources include activities, activity categories, notes, states, and timeslices.

## Usage Patterns

The API layer provides a clean interface for all database operations:

- **CRUD Operations**: Standard create, read, update, delete functions for each resource
- **Error Handling**: Graceful error handling with automatic retries for transient failures
- **Type Safety**: Full TypeScript support with generated database types using `@/shared/types/models`
- **Authentication**: Seamless integration with user sessions

## Development Guidelines

### Adding New Resources

1. Create a new folder in `resources/` named after your database table
2. Implement the standard CRUD operations (get, insert, update, delete)
3. Export all operations from the resource's `index.ts`
4. Add exports to the main `api/index.ts`

### Best Practices

- Always use the `apiCall()` wrapper for Supabase operations
- Implement proper error handling with try-catch blocks
- Use caching for frequently accessed, relatively static data
- Choose appropriate TTL values based on data freshness requirements
- Invalidate cache when data is modified
- Use descriptive function names following the pattern: `[action][Entity][OptionalQualifier]`
- Ensure type safety with proper TypeScript types from `@/shared/types/models`

## Integration & Dependencies

The API layer integrates with:

- **Supabase**: Database operations
- **Clerk**: Authentication and session management
