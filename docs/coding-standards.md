# Coding Standards and Conventions

This document outlines the coding standards, naming conventions, and best practices for the Cadence.day mobile app.

## File and Folder Naming

### Folder Names

- Use **kebab-case** for all folder names
- Be descriptive and consistent

```
features/activity-tracking/
shared/ui-components/
docs/getting-started/
```

### File Names

- Use **PascalCase** for React components: `ActivityCard.tsx`
- Use **camelCase** for utilities and hooks: `formatDate.ts`, `useActivityManagement.ts`
- Use **kebab-case** for configuration files: `app.config.js`, `babel.config.js`
- Use **UPPER_SNAKE_CASE** for constants files: `API_ENDPOINTS.ts`

### File Content Naming Rules

**The file name should match the main export:**

```typescript
// ✅ Good: ActivityCard.tsx
export default function ActivityCard() {}

// ✅ Good: useActivityData.ts
export function useActivityData() {}

// ✅ Good: API_ENDPOINTS.ts
export const API_ENDPOINTS = {};

// ❌ Bad: ActivityCard.tsx
export default function MyComponent() {}
```

## Code Naming Conventions

### Variables and Functions

- Use **camelCase** for variables, functions, and methods
- Use descriptive names that explain purpose

```typescript
// ✅ Good
const userActivityData = [];
const calculateTotalDuration = () => {};
const isActivityCompleted = true;

// ❌ Bad
const data = [];
const calc = () => {};
const flag = true;
```

### Constants

- Use **UPPER_SNAKE_CASE** for constants
- Group related constants in objects or enums

```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;

const ACTIVITY_STATUS = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
} as const;

// ❌ Bad
const maxRetries = 3;
const timeOut = 5000;
```

### Components and Classes

- Use **PascalCase** for React components and classes
- Use descriptive names that indicate functionality

```typescript
// ✅ Good
export default function ActivityTrackingCard() {}
export class DataEncryptionService {}

// ❌ Bad
export default function card() {}
export class service {}
```

### Types and Interfaces

- Use **PascalCase** for TypeScript types and interfaces
- Prefix interfaces with `I` only when necessary for disambiguation
- Use descriptive names

```typescript
// ✅ Good
interface ActivityData {
  id: string;
  name: string;
  duration: number;
}

type ActivityStatus = "active" | "paused" | "completed";

// ❌ Bad
interface IData {
  id: string;
}

type Status = string;
```

## Project Structure Standards

### Feature Organization

Each feature should be self-contained under `features/`:

```
features/
  activity/
    components/         # Feature-specific UI components
    dialogs/           # Feature-specific dialogs
    hooks/             # Feature-specific hooks
    services/          # API and business logic
    stores/            # Feature-specific Zustand stores (if needed)
    index.ts           # Public API exports
    styles.ts          # Feature-specific styles
    types.ts           # Feature-specific types
    utils.ts           # Feature-specific utilities
```

### Shared Code Organization

Shared code goes under `shared/`:

```
shared/
  api/                 # API clients and configurations
  components/          # Reusable UI components
  hooks/              # Reusable hooks
  stores/             # Global Zustand stores
  types/              # Shared TypeScript types
  utils/              # Shared utility functions
```

### Import/Export Standards

#### Use Barrel Exports

Create `index.ts` files for clean imports:

```typescript
// features/activity/index.ts
export { ActivityCard } from "./components/ActivityCard";
export { useActivityData } from "./hooks/useActivityData";
export type { Activity, ActivityStatus } from "./types";

// Usage
import { ActivityCard, useActivityData } from "@/features/activity";
```

#### Import Order

Organize imports in this order:

1. React and React Native imports
2. Third-party library imports
3. Internal imports (features, shared)
4. Relative imports
5. Type-only imports last

```typescript
// ✅ Good import order
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { format } from "date-fns";
import { useActivityStore } from "@/shared/stores";
import { ActivityCard } from "@/features/activity";
import { formatDuration } from "./utils";
import type { Activity } from "@/shared/types";
```

## TypeScript Standards

### Type Definitions

- Always define types for component props
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use union types for specific string values

```typescript
// ✅ Good
interface ActivityCardProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
  isSelected?: boolean;
}

type ActivityStatus = "active" | "paused" | "completed";

// ❌ Bad
function ActivityCard(props: any) {}
type ActivityStatus = string;
```

### Database Types

- Use auto-generated Supabase types
- Create clean model types from database types
- Keep database types and model types separate

```typescript
// shared/types/database.types.ts (auto-generated)
export interface Database {}

// shared/types/models/activity.ts (clean models)
export interface Activity {
  id: string;
  name: string;
  color: string;
  status: ActivityStatus;
  createdAt: Date;
}
```

## Component Standards

### Component Structure

Follow this component structure:

```typescript
// 1. Imports
import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Activity } from '@/shared/types';

// 2. Types
interface ActivityCardProps {
  activity: Activity;
  onPress?: (activity: Activity) => void;
}

// 3. Component
export default function ActivityCard({ activity, onPress }: ActivityCardProps) {
  // 3a. State and hooks
  const [isPressed, setIsPressed] = useState(false);

  // 3b. Event handlers
  const handlePress = () => {
    onPress?.(activity);
  };

  // 3c. Render
  return (
    <Pressable onPress={handlePress}>
      <Text>{activity.name}</Text>
    </Pressable>
  );
}
```

### Props Standards

- Always define prop interfaces
- Use optional props with default values when appropriate
- Include accessibility props

```typescript
interface ComponentProps {
  // Required props first
  title: string;
  onPress: () => void;

  // Optional props second
  subtitle?: string;
  isDisabled?: boolean;

  // Accessibility props
  testID?: string;
  accessibilityLabel?: string;
}
```

## State Management Standards

### Zustand Store Pattern

Follow consistent patterns for Zustand stores:

```typescript
interface ActivityStore {
  // State
  activities: Activity[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadActivities: () => Promise<void>;
  createActivity: (activity: Omit<Activity, "id">) => Promise<Activity | null>;
  updateActivity: (
    id: string,
    updates: Partial<Activity>
  ) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  // Initial state
  activities: [],
  isLoading: false,
  error: null,

  // Actions using handleApiCall pattern
  createActivity: async (activityData) => {
    return handleApiCall(
      set,
      () => activitiesApi.create(activityData),
      "create activity",
      null,
      (newActivity, state) => ({
        activities: [...state.activities, newActivity],
      })
    );
  },
}));
```

## Error Handling Standards

### Global Error Handling

Always use the GlobalErrorHandler for consistent error handling:

```typescript
// ✅ Good
try {
  await riskyOperation();
} catch (error) {
  GlobalErrorHandler.logError(error, "riskyOperation", {
    userId: userData.id,
    operation: "save",
  });
}

// ❌ Bad
try {
  await riskyOperation();
} catch (error) {
  console.error(error);
}
```

### User Feedback

Provide user feedback for all operations:

```typescript
// Show success feedback
showToast({
  type: "success",
  message: t("activity.created"),
});

// Provide haptic feedback
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

## Testing Standards

### Test File Organization

- Place tests next to the files they test
- Use `.test.ts` or `.spec.ts` extension
- Mirror the source file structure

```
features/activity/
  components/
    ActivityCard.tsx
    ActivityCard.test.tsx
  hooks/
    useActivityData.ts
    useActivityData.test.ts
```

### Test Naming

- Use descriptive test names
- Follow "should [expected behavior] when [condition]" pattern

```typescript
describe("ActivityCard", () => {
  it("should display activity name when activity is provided", () => {
    // Test implementation
  });

  it("should call onPress when card is tapped", () => {
    // Test implementation
  });

  it("should show loading state when isLoading is true", () => {
    // Test implementation
  });
});
```

## Git Standards

### Commit Messages

- Use lowercase for commit messages
- Use present tense, imperative mood
- Be descriptive but concise

```bash
# ✅ Good
git commit -m "add activity tracking feature"
git commit -m "fix dialog positioning on android"
git commit -m "update supabase types"

# ❌ Bad
git commit -m "Add Activity Tracking Feature"
git commit -m "fixes"
git commit -m "WIP"
```

### Branch Names

- Use lowercase with hyphens
- Include ticket/issue number when applicable
- Be descriptive

```bash
# ✅ Good
feature/activity-tracking
bugfix/dialog-positioning-android
hotfix/auth-token-refresh

# ❌ Bad
Feature/ActivityTracking
fix
john-branch
```

## Documentation Standards

### Code Comments

- Write comments for complex business logic
- Avoid obvious comments
- Use JSDoc for functions and components

```typescript
/**
 * Calculates the total duration of activities within a date range
 * @param activities - List of activities to calculate
 * @param startDate - Start of the date range
 * @param endDate - End of the date range
 * @returns Total duration in milliseconds
 */
function calculateTotalDuration(
  activities: Activity[],
  startDate: Date,
  endDate: Date
): number {
  // Complex calculation logic here...
}
```

### README Files

- Include README.md in each feature folder
- Document the feature's purpose and key components
- Include usage examples

## Performance Standards

### Component Optimization

- Use React.memo for expensive components
- Use useCallback and useMemo appropriately
- Avoid creating objects in render

```typescript
// ✅ Good
const ActivityCard = React.memo(({ activity, onPress }: ActivityCardProps) => {
  const handlePress = useCallback(() => {
    onPress?.(activity);
  }, [activity, onPress]);

  return <Pressable onPress={handlePress}>...</Pressable>;
});

// ❌ Bad
function ActivityCard({ activity, onPress }: ActivityCardProps) {
  return (
    <Pressable onPress={() => onPress?.(activity)}>
      <View style={{ backgroundColor: 'red' }}>...</View>
    </Pressable>
  );
}
```

### List Optimization

- Use FlatList for large lists
- Implement proper keyExtractor
- Use getItemLayout when item sizes are fixed

```typescript
// ✅ Good
<FlatList
  data={activities}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ActivityCard activity={item} />}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

## Accessibility Standards

### Required Props

Always include accessibility props for interactive components:

```typescript
<Pressable
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Create new activity"
  testID="create-activity-button"
>
  <Text>Create Activity</Text>
</Pressable>
```

### Screen Readers

- Provide meaningful accessibility labels
- Use semantic HTML/RN components
- Test with screen readers

## Security Standards

### Environment Variables

- Never commit secrets to version control
- Use EXPO*PUBLIC* prefix for client-side variables
- Store sensitive data in Doppler or secure env files

```typescript
// ✅ Good
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// ❌ Bad - never do this
const secretKey = "sk_live_abc123...";
```

### Data Handling

- Encrypt sensitive data before storage
- Use Supabase RLS policies
- Validate all user inputs

## Code Review Standards

### What to Review

- Code follows established patterns
- Types are properly defined
- Error handling is implemented
- Tests are included for new features
- Documentation is updated

### Review Comments

- Be constructive and specific
- Suggest improvements, don't just point out problems
- Ask questions to understand intent
- Approve when standards are met

Following these standards ensures consistent, maintainable, and high-quality code across the entire project.
