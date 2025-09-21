# Feature Architecture Guide

This guide explains how features are structured in the Cadence.day mobile app, using the `timeline` feature as a comprehensive example.

## Feature-Based Architecture Overview

The app uses a **feature-based architecture** where each feature is self-contained and modular. Features live under `features/` and contain all their own components, logic, types, and styles.

### Benefits of Feature-Based Architecture

- **Isolation**: Features don't depend on each other's internals
- **Maintainability**: Easy to find and modify feature-specific code
- **Scalability**: New features can be added without affecting existing ones
- **Team collaboration**: Different developers can work on different features
- **Code reuse**: Shared functionality lives in `shared/`

## Standard Feature Structure

Every feature follows this consistent folder structure:

```
features/
  {feature-name}/
    components/           # Feature-specific UI components
      ui/                # Presentational/UI-only components
      {FeatureComponent}.tsx
    dialogs/             # Feature-specific dialog components
      {FeatureDialog}.tsx
      index.ts           # Dialog exports
    hooks/               # Feature-specific custom hooks
      use{FeatureName}.ts
    services/            # API clients and business logic (optional)
      {feature}Api.ts
    stores/              # Feature-specific Zustand stores (optional)
      {feature}Store.ts
    constants/           # Feature-specific constants
      {constants}.ts
    index.ts             # Public API - what other features can import
    styles.ts            # Feature-specific styles and theme
    types.ts             # Feature-specific TypeScript types
    utils.ts             # Feature-specific utility functions
    README.md            # Feature documentation
```

## Timeline Feature: Detailed Example

Let's examine the `timeline` feature as a complete example:

### File Structure

```
features/timeline/
├── components/
│   ├── TimelineTimeslices.tsx    # Main timeline list component
│   └── ui/
│       ├── TimeSlice.tsx         # Individual timeslice component
│       └── MetadataVertical.tsx  # Metadata display component
├── hooks/
│   ├── useTimelineData.ts        # Data fetching and state
│   ├── useTimelineActions.ts     # User interaction handlers
│   ├── useAutomaticTimesliceCreation.ts  # Auto-creation logic
│   ├── useScrollToCurrent.ts     # Scroll behavior
│   ├── useTimelineRefresh.ts     # Refresh logic
│   ├── useWheelHaptics.ts        # Haptic feedback
│   └── usePendingTimeslicesStore.ts  # Local state management
├── constants/
│   └── dimensions.ts             # Timeline-specific dimensions
├── Timeline.tsx                  # Main timeline view component
├── index.ts                      # Public API exports
├── styles.ts                     # Timeline styles
├── types.ts                      # Timeline-specific types
├── utils.ts                      # Timeline utility functions
└── README.md                     # Feature documentation
```

### Key Components Breakdown

#### Main Component (`Timeline.tsx`)

The entry point that composes the entire timeline view:

```typescript
// Timeline.tsx - Main orchestrator component
export default function Timeline() {
  const timelineData = useTimelineData();
  const timelineActions = useTimelineActions();

  return (
    <View>
      <TimelineTimeslices
        timeslices={timelineData.timeslices}
        onTimeslicePress={timelineActions.selectTimeslice}
      />
    </View>
  );
}
```

#### Component Organization (`components/`)

- **Feature components**: Main business logic components (`TimelineTimeslices.tsx`)
- **UI components** (`ui/` folder): Pure presentational components
  - `TimeSlice.tsx`: Individual timeslice display
  - `MetadataVertical.tsx`: Metadata display along timeline

#### Hook Composition (`hooks/`)

Timeline demonstrates excellent hook composition patterns:

```typescript
// useTimelineData.ts - Data management
export function useTimelineData(date: Date) {
  const timeslices = useTimeslicesStore((s) => s.getTimeslicesForDate(date));
  const layoutData = useMemo(() => calculateLayout(timeslices), [timeslices]);

  return {
    timeslices,
    layoutData,
    isLoading: useTimeslicesStore((s) => s.isLoading),
  };
}

// useTimelineActions.ts - User interactions
export function useTimelineActions() {
  const createTimeslice = useTimeslicesStore((s) => s.createTimeslice);
  const updateTimeslice = useTimeslicesStore((s) => s.updateTimeslice);

  return {
    selectTimeslice: (id: string) => {
      /* selection logic */
    },
    createTimeslice: (data: TimesliceData) => createTimeslice(data),
    updateTimeslice: (id: string, updates: Partial<TimesliceData>) =>
      updateTimeslice(id, updates),
  };
}
```

#### Types (`types.ts`)

Feature-specific types that define the data structures:

```typescript
// types.ts
export interface Timeslice {
  id: string;
  activityId: string;
  startTime: Date;
  endTime: Date;
  metadata?: TimesliceMetadata;
}

export interface TimesliceMetadata {
  notes?: string;
  mood?: number;
  tags?: string[];
}

export interface TimelineLayoutData {
  totalWidth: number;
  visibleSlices: Timeslice[];
  currentTimePosition: number;
}
```

## Dialog Integration

Features can include their own dialogs in the `dialogs/` subfolder:

### Dialog Structure

```
features/activity/
  dialogs/
    CreateActivityDialog.tsx    # Create new activity
    EditActivityDialog.tsx      # Edit existing activity
    ActivityLegendDialog.tsx    # Activity legend/list
    CategoryPickerDialog.tsx    # Pick activity category
    ColorPickerDialog.tsx       # Pick activity color
    index.ts                    # Export all dialogs
```

### Dialog Export Pattern

```typescript
// features/activity/dialogs/index.ts
export { default as CreateActivityDialog } from "./CreateActivityDialog";
export { default as EditActivityDialog } from "./EditActivityDialog";
export { default as ActivityLegendDialog } from "./ActivityLegendDialog";
// ... other exports
```

### Dialog Registration

Dialogs are registered in the global dialog registry:

```typescript
// shared/dialogs/registry.tsx
import {
  CreateActivityDialog,
  EditActivityDialog,
} from "@/features/activity/dialogs";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  "activity-create": CreateActivityDialog,
  "activity-edit": EditActivityDialog,
  // ... other dialogs
};
```

## Public API Pattern (`index.ts`)

Every feature exports its public API through `index.ts`:

```typescript
// features/timeline/index.ts
// Components
export { default as Timeline } from "./Timeline";

// Hooks (only if meant to be used by other features)
export { useTimelineData } from "./hooks/useTimelineData";

// Types (only public interfaces)
export type { Timeslice, TimesliceMetadata } from "./types";

// Utils (only if meant to be used by other features)
export { calculateTimelineLayout } from "./utils";
```

**Important**: Only export what other features need to use. Keep internal implementation details private.

## Feature Communication Patterns

### 1. Shared Stores

Features communicate through shared Zustand stores:

```typescript
// Timeline feature uses shared activity store
const activities = useActivitiesStore((s) => s.activities);
const getActivity = useActivitiesStore((s) => s.getActivityById);
```

### 2. Dialog System

Features can open dialogs from other features:

```typescript
// Timeline opens activity creation dialog
const openDialog = useDialogStore((s) => s.openDialog);

const handleCreateActivity = () => {
  openDialog({
    type: "activity-create",
    props: { onActivityCreated: handleActivityCreated },
  });
};
```

### 3. Events and Callbacks

Features pass callbacks for cross-feature communication:

```typescript
// Parent passes callback to child feature
<Timeline
  onActivitySelect={(activity) => {
    // Handle activity selection
  }}
/>
```

## Shared Code Integration

Features use shared code from `shared/`:

### Shared Components

```typescript
// Using shared UI components
import { Button, Card, Toast } from "@/shared/components";
```

### Shared Hooks

```typescript
// Using shared hooks
import { useI18n, useGlobalError } from "@/shared/hooks";
```

### Shared Stores

```typescript
// Using shared stores
import { useActivitiesStore, useUserStore } from "@/shared/stores";
```

### Shared Types

```typescript
// Using shared types
import type { Activity, User } from "@/shared/types/models";
```

## Best Practices for Feature Development

### 1. Start with Types

Define your feature's data structures first:

```typescript
// features/my-feature/types.ts
export interface MyFeatureData {
  id: string;
  name: string;
  // ... other properties
}
```

### 2. Create the Main Component

Build your main feature component:

```typescript
// features/my-feature/MyFeature.tsx
export default function MyFeature() {
  // Feature logic here
}
```

### 3. Extract Logic into Hooks

Move complex logic into custom hooks:

```typescript
// features/my-feature/hooks/useMyFeatureData.ts
export function useMyFeatureData() {
  // Data fetching and state management
}

// features/my-feature/hooks/useMyFeatureActions.ts
export function useMyFeatureActions() {
  // User interaction handlers
}
```

### 4. Add UI Components

Create presentational components:

```typescript
// features/my-feature/components/ui/MyFeatureCard.tsx
export default function MyFeatureCard({ data, onPress }) {
  // Pure UI component
}
```

### 5. Create Dialogs (if needed)

Add feature-specific dialogs:

```typescript
// features/my-feature/dialogs/MyFeatureDialog.tsx
export default function MyFeatureDialog({ _dialogId }) {
  // Dialog implementation
}
```

### 6. Export Public API

Define what other features can use:

```typescript
// features/my-feature/index.ts
export { default as MyFeature } from "./MyFeature";
export { useMyFeatureData } from "./hooks/useMyFeatureData";
export type { MyFeatureData } from "./types";
```

### 7. Add Documentation

Document your feature:

```markdown
<!-- features/my-feature/README.md -->

# My Feature

## Overview

What this feature does...

## Key Components

- MyFeature.tsx: Main component
- hooks/: Feature hooks

## Usage

How to use this feature...
```

## Testing Features

### Test Structure

Mirror your feature structure in tests:

```
features/my-feature/
  __tests__/
    MyFeature.test.tsx
    hooks/
      useMyFeatureData.test.ts
  components/
    ui/
      __tests__/
        MyFeatureCard.test.tsx
```

### Test Examples

```typescript
// features/my-feature/__tests__/MyFeature.test.tsx
describe("MyFeature", () => {
  it("should render feature correctly", () => {
    // Test implementation
  });
});
```

## Common Patterns

### 1. Data + Actions Hook Pattern

Separate data fetching from user actions:

```typescript
// Data hook
export function useFeatureData() {
  return { data, isLoading, error };
}

// Actions hook
export function useFeatureActions() {
  return { create, update, delete };
}
```

### 2. Composition Hook Pattern

Combine multiple hooks for complex features:

```typescript
export function useFeatureManagement() {
  const data = useFeatureData();
  const actions = useFeatureActions();
  const ui = useFeatureUI();

  return { ...data, ...actions, ...ui };
}
```

### 3. Store Integration Pattern

Integrate with shared stores consistently:

```typescript
export function useFeatureStore() {
  const items = useSharedStore((s) => s.items);
  const addItem = useSharedStore((s) => s.addItem);

  return {
    items: items.filter(/* feature-specific filter */),
    addItem: (item) => addItem({ ...item, featureSpecific: true }),
  };
}
```

## Feature Checklist

When creating a new feature, ensure you have:

- [ ] Main feature component
- [ ] Feature-specific types in `types.ts`
- [ ] Custom hooks for data and actions
- [ ] UI components in `components/ui/`
- [ ] Dialogs in `dialogs/` (if needed)
- [ ] Public API exports in `index.ts`
- [ ] Feature documentation in `README.md`
- [ ] Tests for critical functionality
- [ ] Integration with shared stores
- [ ] Error handling and user feedback
- [ ] Accessibility support
- [ ] TypeScript types for all interfaces

This architecture ensures features remain maintainable, testable, and scalable as the app grows.
