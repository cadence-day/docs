# Sentry User Feedback Implementation

This document describes the comprehensive user feedback system implemented in the Cadence.day mobile app using Sentry's feedback features.

## Overview

We've implemented multiple ways for users to provide feedback:

1. **Sentry's Native Feedback Widget** - Built-in modal feedback form
2. **Floating Feedback Button** - Persistent feedback button overlay
3. **Embedded Feedback Widget** - In-page feedback component
4. **Custom Feedback Form** - Our own custom-styled feedback form
5. **Programmatic Feedback API** - Direct API calls for custom implementations

## Features Implemented

### 📱 Settings Page (`/settings`)

A comprehensive settings page that demonstrates all feedback methods:

- **Send Feedback (Native)** - Opens Sentry's built-in feedback modal
- **Send Feedback (Custom)** - Opens our custom feedback form
- **Show/Hide Widget Component** - Toggles embedded feedback widget
- **Show/Hide Floating Button** - Toggles persistent floating feedback button
- **Test Custom Feedback** - Demonstrates programmatic feedback submission

### 🎨 Custom Feedback Form (`/custom-feedback`)

A fully customized feedback form with:

- Optional name and email fields
- Required message field
- Proper form validation
- Loading states
- Success/error handling
- Keyboard-aware scrolling
- Modal presentation

### 🔧 Sentry Integration

#### Configuration in `app/_layout.tsx`:

```typescript
Sentry.init({
  dsn: SECRETS.EXPO_PUBLIC_SENTRY_DSN || "fallback_dsn",
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration({
      styles: {
        submitButton: { backgroundColor: "#007bff" },
      },
      namePlaceholder: "Your name (optional)",
      emailPlaceholder: "Your email (optional)",
      messagePlaceholder: "Tell us what happened. What did you expect?",
      submitButtonLabel: "Send Feedback",
      cancelButtonLabel: "Cancel",
    }),
  ],
});

export default Sentry.wrap(function RootLayout() {
  // ... app content
});
```

#### Available Feedback Methods:

1. **Modal Feedback Widget**:

   ```typescript
   Sentry.showFeedbackWidget();
   ```

2. **Floating Feedback Button**:

   ```typescript
   Sentry.showFeedbackButton(); // Show
   Sentry.hideFeedbackButton(); // Hide
   ```

3. **Embedded Widget Component**:

   ```typescript
   import { FeedbackWidget } from "@sentry/react-native";
   <FeedbackWidget />
   ```

4. **Programmatic Feedback**:
   ```typescript
   Sentry.captureFeedback({
     name: "User Name",
     email: "user@example.com",
     message: "Feedback message",
     associatedEventId: eventId, // Optional
   });
   ```

## File Structure

```
app/
├── (home)/
│   ├── settings.tsx              # Main settings page with all feedback options
│   ├── custom-feedback.tsx       # Custom feedback form page
│   └── sentry-test.tsx           # Sentry integration testing page
shared/
├── components/
│   └── CustomFeedbackForm.tsx    # Reusable custom feedback component
└── utils/
    └── errorHandler.ts           # Enhanced error handling with Sentry
```

## Usage Examples

### In React Components:

```typescript
import * as Sentry from "@sentry/react-native";
import { FeedbackWidget } from "@sentry/react-native";

// Open modal feedback form
const openFeedback = () => {
  Sentry.showFeedbackWidget();
};

// Show floating button
const showFloatingButton = () => {
  Sentry.showFeedbackButton();
};

// Custom feedback submission
const submitCustomFeedback = () => {
  Sentry.captureFeedback({
    message: "Great app! Suggestion: add dark mode",
    name: "John Doe",
    email: "john@example.com"
  });
};

// Embedded widget
return (
  <View>
    <FeedbackWidget />
  </View>
);
```

### With Error Context:

```typescript
import { useErrorHandler } from "@/shared/utils/errorHandler";

const { logError } = useErrorHandler();

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  const eventId = logError(error, "ComponentName.operation");

  // Associate feedback with specific error
  Sentry.captureFeedback({
    message: "I encountered this error while trying to save my data",
    associatedEventId: eventId,
  });
}
```

## Navigation Structure

The feedback system is integrated into the app navigation:

```
Home Page
├── ⚙️ Settings → Settings Page
│   ├── 📝 Send Feedback (Native) → Sentry Modal
│   ├── 📝 Send Feedback (Custom) → Custom Form Page
│   ├── 🔘 Show/Hide Floating Button → Overlay
│   ├── 📋 Show/Hide Widget Component → Embedded Widget
│   └── 🧪 Test Custom Feedback → API Call
└── 🔧 Test Sentry Integration → Debug Page
```

## Development vs Production

### Development Mode:

- Feedback integration is fully functional for testing
- All feedback methods work in development
- Sentry data collection is disabled by default
- Console logging shows feedback activity

### Production Mode:

- Full Sentry integration enabled
- All feedback data sent to Sentry dashboard
- Error tracking and performance monitoring active
- User feedback associated with error events

## Best Practices

1. **Multiple Feedback Options**: Offer various ways for users to provide feedback based on context
2. **Error Association**: Link feedback to specific error events when possible
3. **User Context**: Set user information to make feedback more actionable
4. **Offline Support**: Feedback is cached offline and sent when connection is restored
5. **Custom Styling**: Match feedback UI to your app's design system
6. **Validation**: Ensure feedback forms have proper validation and error handling

## Testing the Implementation

1. **Navigate to Settings**: From home page → Settings
2. **Test Native Feedback**: Tap "Send Feedback (Native)" to see Sentry's modal
3. **Test Custom Form**: Tap "Send Feedback (Custom)" to see our custom form
4. **Test Floating Button**: Toggle floating button to see persistent overlay
5. **Test Embedded Widget**: Toggle widget component to see embedded form
6. **Test API**: Use "Test Custom Feedback" to see programmatic submission

## Configuration Options

The feedback integration can be customized via the `feedbackIntegration` options:

```typescript
Sentry.feedbackIntegration({
  // Styling
  styles: {
    submitButton: { backgroundColor: "#007bff" },
    cancelButton: { backgroundColor: "#6c757d" },
  },

  // Text customization
  namePlaceholder: "Your name (optional)",
  emailPlaceholder: "Your email (optional)",
  messagePlaceholder: "Describe what happened...",
  submitButtonLabel: "Send Feedback",
  cancelButtonLabel: "Cancel",

  // Additional options
  showName: true,
  showEmail: true,
  isRequired: false,
});
```

This implementation provides a comprehensive feedback system that enhances user engagement and helps improve the app based on real user input.
