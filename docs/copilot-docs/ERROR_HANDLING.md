# Global Error Handling

This document describes the global error handling system implemented in the Cadence.day mobile app.

## Overview

The global error handling system provides a unified way to handle errors throughout the application, with different behavior for development and production environments:

- **Development**: Errors are logged to the console with detailed information
- **Production**: Errors are sent to Sentry (when implemented)

## Implementation Coverage

The global error handler has been implemented across the following areas:

### ✅ **Shared Utilities**

- `GlobalErrorHandler` class with methods for logging errors, warnings, and debug info
- `useDev` hook for environment detection
- `useErrorHandler` hook for React components

### ✅ **API Layer** (`shared/api/`)

- Updated `handleApiError` and `handleApiErrorWithRetry` to use global error handler
- Enhanced retry logic with better error context
- Encryption layer error handling for activities and notes
- Core encryption error handling

### ✅ **Store Layer** (`shared/stores/`)

- Updated store error handling utilities to use global error handler
- Activities store with enhanced error context
- Error state creation with automatic global logging

### ✅ **Auth Layer** (`shared/auth/`)

- Enhanced Clerk error parsing with global error logging
- New `handleAuthError` and `handleAuthWarning` functions
- Updated SignIn and SignUp components to use auth error handlers
- Automatic error tracking for authentication flows

## Components

### 1. `useDev` Hook

A global hook to determine if we are in a development environment.

```typescript
import { useDev } from "@/shared/hooks/useDev";

const MyComponent = () => {
  const isDev = useDev();

  return (
    <View>
      {isDev && <Text>Development Mode</Text>}
    </View>
  );
};
```

### 2. `GlobalErrorHandler` Class

A centralized error handler that routes errors appropriately based on environment.

#### Methods

- `logError(error, context?, extra?)` - Log errors with context
- `logWarning(message, context?, extra?)` - Log warnings
- `logDebug(message, context?, data?)` - Log debug info (dev only)

#### Usage Examples

```typescript
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

// Basic error logging
try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  GlobalErrorHandler.logError(error, "riskyOperation");
}

// Error with additional context
try {
  await saveUserData(userData);
} catch (error) {
  GlobalErrorHandler.logError(error, "saveUserData", {
    userId: userData.id,
    operation: "save",
  });
}

// Warning logging
GlobalErrorHandler.logWarning(
  "User attempted invalid action",
  "userValidation",
  { action: "invalidAction", userId: "123" }
);

// Debug logging (only in development)
GlobalErrorHandler.logDebug("API response received", "apiCall", {
  responseTime: 150,
  endpoint: "/api/users",
});
```

### 3. `useErrorHandler` Hook

A React hook version of the error handler for use in components.

```typescript
import { useErrorHandler } from "@/shared/utils/errorHandler";

const MyComponent = () => {
  const { logError, logWarning, logDebug } = useErrorHandler();

  const handleSubmit = async (data) => {
    try {
      await submitForm(data);
    } catch (error) {
      logError(error, "formSubmission", { formType: "userProfile" });
    }
  };

  return (
    // Your component JSX
  );
};
```

## Integration Examples

### API Layer

```typescript
// Enhanced API error handling with retry logic
export async function handleApiErrorWithRetry<T>(
  context: string,
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Retry logic with global error logging
  GlobalErrorHandler.logWarning(
    `Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying`,
    `API_RETRY_${context}`,
    { attempt, delayMs, error: getErrorMessage(error) }
  );
}
```

### Store Layer

```typescript
// Store error handling
export function createErrorState(error: unknown, operationName: string) {
  const errorMessage = extractErrorMessage(error, operationName);

  // Log the error using global error handler
  GlobalErrorHandler.logError(error, `STORE_${operationName}`, {
    operationName,
    errorType: error?.constructor?.name || typeof error,
    storeContext: true,
  });

  return {
    error: errorMessage,
    isLoading: false,
  };
}
```

### Auth Layer

```typescript
// Authentication error handling
export const handleAuthError = (
  error: any,
  context: string,
  extra?: Record<string, any>
) => {
  GlobalErrorHandler.logError(error, `AUTH_${context}`, {
    authContext: context,
    errorType: error?.constructor?.name || typeof error,
    ...extra,
  });
};

// Enhanced Clerk error parsing
export const parseClerkErrors = (error: any): ParsedClerkError => {
  // Parse errors and log with global handler
  GlobalErrorHandler.logError(error, "AUTH_CLERK_VALIDATION", {
    errorCount: error.errors.length,
    errorDetails,
    fieldErrorsGenerated: fieldErrors,
  });
};
```

### Encryption Layer

```typescript
// Encryption error handling with fallback
export async function encryptActivityName(
  activity: Activity
): Promise<Activity> {
  try {
    const encryptedName = await encryptString(activity.name);
    return { ...activity, name: encryptedName };
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_ACTIVITY_NAME", {
      activityId: activity.id,
      operation: "encrypt",
      fallbackBehavior: "return_original",
    });
    return activity; // Graceful fallback
  }
}
```

## Development vs Production Behavior

### Development Environment

- Errors logged to console with detailed information
- Stack traces included
- Debug messages shown
- Grouped console output for better readability
- Enhanced context for debugging

### Production Environment

- Errors sent to Sentry (when implemented)
- Fallback to console logging if Sentry fails
- Debug messages suppressed
- Sensitive information filtered
- Performance monitoring ready

## Error Context Categories

The system uses structured context categories for better error tracking:

- `API_*` - API-related errors
- `STORE_*` - State management errors
- `AUTH_*` - Authentication errors
- `ENCRYPTION_*` - Encryption/decryption errors
- `DECRYPTION_*` - Decryption-specific errors

## Future Enhancements

### Sentry Integration

When Sentry is added to the project, update the `sendToSentry` and `sendWarningToSentry` methods in `GlobalErrorHandler`:

1. Install Sentry packages:

```bash
npm install @sentry/react-native
```

2. Update the error handler methods to use Sentry APIs
3. Add Sentry configuration to app initialization

### Additional Features

- Error boundaries integration
- Performance monitoring
- Custom error types
- Error rate limiting
- User feedback collection
- Error analytics dashboard

## Best Practices

1. **Always provide context**: Include meaningful context when logging errors
2. **Include relevant data**: Add extra data that helps with debugging
3. **Use appropriate log levels**:
   - `logError` for actual errors
   - `logWarning` for concerning but non-fatal issues
   - `logDebug` for development information
4. **Don't log sensitive information**: Avoid logging passwords, tokens, or personal data
5. **Handle errors gracefully**: Always provide fallback behavior when possible
6. **Use structured context**: Follow the context naming conventions

## Migration Guide

### Before

```typescript
try {
  await someOperation();
} catch (error) {
  console.error("Failed to save:", error);
}
```

### After

```typescript
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

try {
  await someOperation();
} catch (error) {
  GlobalErrorHandler.logError(error, "someOperation", {
    operationType: "save",
  });
}
```

## Summary

The global error handling system is now fully implemented across:

- ✅ API layer with retry logic and context
- ✅ Store layer with automatic error state management
- ✅ Auth layer with Clerk-specific error handling
- ✅ Encryption layer with graceful fallbacks
- ✅ Component layer with React hooks

All console.error calls have been replaced with structured error logging that automatically routes to the appropriate destination based on environment.
