# Sentry Integration

This document describes how Sentry is integrated with the GlobalErrorHandler in the Cadence.day mobile app.

## Overview

Sentry is automatically initialized in `app/_layout.tsx` and integrated with our `GlobalErrorHandler` utility class. This provides comprehensive error tracking, performance monitoring, and debugging capabilities for production builds.

## Configuration

### Environment Variables

Add the following environment variable to your `.env` files:

```
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

If not provided, the app will fall back to the default DSN configured in `app/_layout.tsx`.

### Features

- **Automatic Error Reporting**: Errors are automatically sent to Sentry in production
- **Session Replay**: Mobile sessions are recorded for debugging (10% sample rate, 100% on errors)
- **User Context**: Set user information for better error tracking
- **Breadcrumbs**: Add debugging breadcrumbs to track user actions
- **Environment Filtering**: Only sends data in production builds
- **Spotlight Integration**: Development debugging with Spotlight

## Usage

### Basic Error Logging

```typescript
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

// Log an error
GlobalErrorHandler.logError(
  new Error("Something went wrong"),
  "UserService.updateProfile",
  { userId: "123", profileData: data }
);

// Log a warning
GlobalErrorHandler.logWarning(
  "API response took longer than expected",
  "ApiClient.request",
  { endpoint: "/api/users", duration: 5000 }
);

// Log debug info (development only)
GlobalErrorHandler.logDebug("User action completed", "UserActions.submitForm", {
  formData: data,
});
```

### Using the Hook

```typescript
import { useErrorHandler } from '@/shared/utils/errorHandler';

function MyComponent() {
  const { logError, logWarning, setUserContext, addBreadcrumb } = useErrorHandler();

  useEffect(() => {
    // Set user context when user is authenticated
    setUserContext({
      id: user.id,
      email: user.email,
      username: user.username
    });
  }, [user]);

  const handleAction = async () => {
    try {
      // Add breadcrumb for user action
      addBreadcrumb('User clicked submit button', 'user-action');

      await someAsyncOperation();
    } catch (error) {
      logError(error, 'MyComponent.handleAction', {
        userId: user.id,
        timestamp: Date.now()
      });
    }
  };

  return (
    // Your component JSX
  );
}
```

### Setting User Context

```typescript
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

// When user signs in
GlobalErrorHandler.setUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
});

// When user signs out
GlobalErrorHandler.setUserContext({});
```

### Adding Breadcrumbs

```typescript
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

// Track user navigation
GlobalErrorHandler.addBreadcrumb(
  "User navigated to profile page",
  "navigation",
  "info",
  { route: "/profile", previousRoute: "/dashboard" }
);

// Track API calls
GlobalErrorHandler.addBreadcrumb("API request started", "api", "info", {
  endpoint: "/api/users",
  method: "GET",
});

// Track user interactions
GlobalErrorHandler.addBreadcrumb(
  "User clicked save button",
  "user-interaction",
  "info",
  { component: "ProfileForm", formData: formData }
);
```

## Development vs Production

### Development

- Errors are logged to console with detailed formatting
- Breadcrumbs are logged to console
- No data is sent to Sentry
- Spotlight is enabled for debugging

### Production

- Errors are sent to Sentry with full context
- Session replay is enabled (10% sample rate)
- User context and breadcrumbs are included
- Console fallback if Sentry fails

## Best Practices

1. **Always provide context**: Include the component/function name and relevant data
2. **Use appropriate log levels**: Error for exceptions, Warning for unexpected but handled situations, Debug for development info
3. **Set user context early**: Set user information as soon as the user is authenticated
4. **Add meaningful breadcrumbs**: Track user actions that lead to errors
5. **Don't log sensitive data**: Avoid logging passwords, tokens, or personal information
6. **Use structured data**: Provide extra context as key-value pairs rather than in error messages

## Error Types

- **Error**: Unhandled exceptions, API failures, critical issues
- **Warning**: Handled exceptions, deprecated API usage, performance issues
- **Debug**: Development information, state changes, user actions (development only)

## Performance Considerations

- Sentry data is only collected in production builds
- Session replay has a 10% sample rate to minimize performance impact
- Breadcrumbs are limited and automatically pruned by Sentry
- Error reports include minimal context to reduce payload size
