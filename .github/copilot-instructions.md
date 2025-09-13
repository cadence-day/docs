# Copilot AI Agent Instructions for Cadence.day Mobile App

## Project Overview

- **Cross-platform mobile app** built with React Native, TypeScript, and Expo
- Major features: activity tracking, notes (with speech-to-text), AI chat (Sage), calendar integration, notifications, onboarding, and sharing
- State management: [zustand](https://github.com/pmndrs/zustand) with complex store patterns
- Backend: Supabase (API, auth, storage), LangChain/LangGraph for AI, Doppler for secrets
- **Modular architecture**: Features are self-contained under `features/` with their own components, hooks, services, and types

## Architecture & Patterns

### Feature-Based Architecture

- **Features are modularized** under `features/` (e.g., `features/activity/`, `features/sage/`)
- Each feature contains: `components/`, `hooks/`, `services/`, `types.ts`, `utils.ts`, `styles.ts`
- **Shared code** in `shared/` (UI, hooks, stores, utils, types)
- **Single responsibility**: Features handle their own business logic, UI, and state

### State Management Patterns

- **Zustand stores** in `shared/stores/resources/` for domain data (activities, notes, etc.)
- **Store utilities** in `shared/stores/utils/` with `handleApiCall`, `handleVoidApiCall` patterns
- **Global error handling** via `GlobalErrorHandler` with environment-specific routing
- **Store operations**: CRUD operations with optimistic updates and error recovery

### Data Flow Architecture

- **Database types** auto-generated from Supabase schema (`shared/types/database.types.ts`)
- **API layer** in `shared/api/` with encryption for sensitive data
- **Local storage** via `shared/storage/` for offline persistence
- **Environment variables** via `SECRETS` from Doppler or `.env` files

### Component Patterns

- **Hook composition**: Complex hooks combine multiple concerns (e.g., `useActivityManagement`)
- **Type-safe props**: Extensive use of TypeScript interfaces for component contracts
- **Accessibility**: Built-in `testID` and `accessibilityLabel` props
- **Haptic feedback**: Integrated throughout for user interactions

## Developer Workflows

### Development Setup

- **Local development**: `npm run start:dev` (uses `.env.development`)
- **Production simulation**: `npm start` (uses Doppler secrets)
- **Platform specific**: `npm run ios:dev` / `npm run android:dev`
- **Supabase local**: `supabase start` + `npm run dev:types:update`

### Build & Deployment

- **Type generation**: `npm run types:update` (prod) or `npm run dev:types:update` (local)
- **EAS builds**: `eas build --platform ios|android --profile production`
- **Updates**: `npm run eas:update` for Expo Go updates
- **Environment switching**: Press `s` in Expo CLI to toggle dev build vs Expo Go

### Code Quality

- **Linting**: `npm run lint` (ESLint) + `npm run lint:fix`
- **Formatting**: `npm run format` (Prettier) + `npm run format:check`
- **Type checking**: `npm run typescript`
- **Testing**: `npm test` (Jest with Expo preset)

## Project-Specific Conventions

### File Organization

- **Feature structure**: `features/{feature}/components/`, `hooks/`, `services/`, `types.ts`
- **Shared organization**: `shared/{api,stores,types,utils,components,hooks}/`
- **Constants**: `shared/constants/` with UPPER_SNAKE_CASE naming
- **Naming**: `camelCase` for code, `PascalCase` for components, `kebab-case` for folders

### Error Handling

- **Global error handler**: `GlobalErrorHandler.logError()` with context and environment routing
- **Store error states**: Automatic error state management with `createErrorState()`
- **API error handling**: `handleApiErrorWithRetry()` with exponential backoff
- **User feedback**: Haptic feedback + toast notifications for all operations

### State Management

- **Store patterns**: CRUD operations with `handleApiCall` wrapper for consistency
- **Optimistic updates**: Immediate UI updates with rollback on failure
- **Loading states**: `isLoading` flags with automatic state management
- **Data persistence**: Local storage for offline-first functionality

### Type Safety

- **Database types**: Auto-generated from Supabase schema
- **Model types**: Clean interfaces in `shared/types/models/`
- **API responses**: Fully typed with generated types
- **Component props**: Extensive interfaces with optional accessibility props

## Key Files & Directories

### Core Architecture

- `features/` — Self-contained feature modules
- `shared/stores/resources/` — Domain-specific zustand stores
- `shared/api/` — API client with encryption layer
- `shared/types/database.types.ts` — Auto-generated Supabase types
- `shared/utils/errorHandler.ts` — Global error handling system

### Configuration

- `shared/constants/SECRETS.ts` — Environment variable access
- `app.json` — Expo configuration with plugin setup
- `supabase/config.toml` — Database configuration
- `docs/` — Setup and integration guides

### Development Tools

- `package.json` — All scripts and dependencies
- `jest.config.js` — Testing configuration
- `tsconfig.json` — TypeScript configuration
- `babel.config.js` — Babel configuration for Expo

## Common Patterns & Examples

### Store Operations

```typescript
// Store with API integration
insertActivity: async (activity) => {
  return handleApiCall(
    set,
    () => activitiesApi.insertActivity(activity),
    "create activity",
    null,
    (newActivity, state) => ({
      activities: [...state.activities, newActivity],
    })
  );
};
```

### Hook Composition

```typescript
// Complex hook combining multiple concerns
export const useActivityManagement = (props) => {
  const gridCalculations = useGridCalculations(props);
  const dragOperations = useDragOperations(props);
  const storeOperations = useStoreOperations();

  return {
    ...gridCalculations,
    ...dragOperations,
    ...storeOperations,
  };
};
```

### Error Handling

```typescript
// Consistent error handling with context
try {
  await riskyOperation();
} catch (error) {
  GlobalErrorHandler.logError(error, "riskyOperation", {
    userId: userData.id,
    operation: "save",
  });
}
```

### Type Definitions

```typescript
// Feature-specific types with shared types
export interface ActivityDialogProps {
  mode?: DialogMode;
  activity?: Activity; // From shared/types/models
  onActivityCreated?: (activity: Activity) => void;
}
```

## Integration Points

### External Services

- **Supabase**: Database, auth, storage with auto-generated types
- **Clerk**: Authentication with Expo integration
- **Doppler**: Secret management with fallback to .env files
- **Sentry**: Error tracking with Expo plugin
- **LangChain/LangGraph**: AI chat functionality in `features/sage/`

### Cross-Feature Communication

- **Store subscriptions**: Zustand stores for cross-feature state
- **Dialog system**: `shared/dialogs/` for modal management
- **Toast notifications**: `shared/components/Toast.tsx` for user feedback
- **Navigation**: Expo Router with typed routes

---

## Best Practices

1. **Feature isolation**: Keep business logic within feature boundaries
2. **Type safety first**: Use generated types and define interfaces for all data
3. **Error handling**: Always use `GlobalErrorHandler` with meaningful context
4. **State management**: Follow store patterns with `handleApiCall` wrapper
5. **Component composition**: Prefer hooks over complex component logic
6. **Accessibility**: Include `testID` and `accessibilityLabel` in components
7. **Haptic feedback**: Add appropriate feedback for user interactions

For new patterns, follow the structure and conventions of existing features. When in doubt, check the README or docs, and prefer composition over inheritance.
