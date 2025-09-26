# Onboarding Feature

## Overview

The Onboarding feature provides a multi-step walkthrough for new users to introduce them to Cadence.day's core features and set up initial preferences. It follows the project's feature-based architecture with proper separation of concerns.

## Key Components

### Main Component
- **OnboardingDialog.tsx**: Main orchestrator component that composes the entire onboarding flow

### UI Components (`components/ui/`)
- **OnboardingIcon.tsx**: Custom SVG icon for the welcome screen
- **OnboardingPageIndicators.tsx**: Page navigation dots component

### Hooks (`hooks/`)
- **useOnboardingData.ts**: Manages onboarding pages data and current page state
- **useOnboardingActions.ts**: Handles user actions (permissions, privacy policy, completion)
- **useOnboardingPage.ts**: Enhances current page with dynamic actions based on content

### Types (`types.ts`)
- **OnboardingPage**: Interface for individual onboarding page data
- **OnboardingDialogHandle**: Ref handle interface for imperative control
- **OnboardingDialogProps**: Props interface for the main dialog
- **NotificationPreferences**: Interface for notification setup

## Architecture Pattern

This feature follows the **Data + Actions Hook Pattern**:

1. **Data Hook** (`useOnboardingData`): Manages page content, current page state, and navigation
2. **Actions Hook** (`useOnboardingActions`): Handles all user interactions and side effects
3. **Page Hook** (`useOnboardingPage`): Dynamically enhances pages with actions based on content

## Usage

### Basic Usage
```typescript
import OnboardingDialog from "@/features/onboarding";

function MyComponent() {
  return (
    <OnboardingDialog
      confirm={() => console.log("Onboarding completed")}
    />
  );
}
```

### With Dialog System
```typescript
import { useDialogStore } from "@/shared/stores/useDialogStore";

const openDialog = useDialogStore((s) => s.openDialog);

const handleShowOnboarding = () => {
  openDialog({
    type: "onboarding",
    props: {
      confirm: () => {
        // Handle completion
      }
    }
  });
};
```

### Using Hooks Independently
```typescript
import { useOnboardingData, useOnboardingActions } from "@/features/onboarding";

function CustomOnboarding() {
  const { pages, currentPage, goToPage } = useOnboardingData();
  const { handleNotificationPermission } = useOnboardingActions();

  // Custom onboarding implementation
}
```

## Onboarding Flow

The onboarding consists of 6 pages:

1. **Welcome**: Introduction to Cadence with app icon
2. **Memory Expansion**: Explanation of activity tracking
3. **Notifications**: Permission request with action button
4. **Meet Sage**: Introduction to AI guide with animated icon
5. **Privacy**: Privacy policy information with link
6. **Customization**: Final setup information

## Key Features

### Dynamic Actions
Pages automatically get the correct actions based on their content:
- **Notifications page**: Gets "Allow Notifications" button
- **Privacy page**: Gets "Read More" link to privacy policy

### Storage Integration
- Automatically persists onboarding completion status
- Uses `userOnboardingStorage` to prevent re-prompting

### Notification Setup
- Requests notification permissions
- Sets up default Cadence notification preferences when granted

### Error Handling
- Graceful handling of storage errors
- Proper error logging for debugging

## Styling

All styles are centralized in `styles.ts` following the project's styling patterns. The component uses a clean, centered layout with:
- White text on transparent background
- Consistent spacing and typography
- Interactive elements with proper touch targets

## Integration Points

### Shared Dependencies
- **Notifications**: Uses `@/shared/notifications` for permission handling
- **Storage**: Uses `@/shared/storage/user/onboarding` for persistence
- **Icons**: Uses `@/shared/components/icons/SageIcon` for Sage introduction
- **i18n**: Uses `@/shared/hooks/useI18n` for internationalization
- **Error Handling**: Uses `@/shared/utils/errorHandler` for error logging

### Dialog System Integration
- Compatible with `@/shared/dialogs` system
- Supports dialog ID for programmatic closing
- Maintains dialog state for host component integration

## Testing

### Unit Tests
Create tests for each hook and component:

```typescript
// __tests__/useOnboardingData.test.ts
describe('useOnboardingData', () => {
  it('should navigate between pages correctly', () => {
    // Test page navigation logic
  });
});

// __tests__/OnboardingDialog.test.tsx
describe('OnboardingDialog', () => {
  it('should render all pages correctly', () => {
    // Test page rendering
  });
});
```

## Future Enhancements

- Add analytics tracking for page completion rates
- Support for dynamic page content based on user preferences
- A/B testing support for different onboarding flows
- Skip functionality for returning users
- Progress persistence for interrupted onboarding sessions

## Migration Notes

This refactored implementation:
- ✅ Follows proper feature architecture patterns
- ✅ Separates concerns with dedicated hooks
- ✅ Uses proper TypeScript interfaces
- ✅ Maintains backward compatibility
- ✅ Improves testability and maintainability