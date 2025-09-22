# Background Notification Task Manager

This system provides reliable background notification scheduling and delivery for the Cadence app using Expo's task manager and background fetch capabilities.

## Overview

The background task manager ensures notifications are delivered even when the app is closed or backgrounded by:

1. **Short-term notifications** (< 30 minutes): Scheduled directly with Expo Notifications
2. **Long-term notifications** (> 30 minutes): Stored and processed by background tasks
3. **Periodic checks**: Background tasks run every 15 minutes to process queued notifications

## Key Components

### BackgroundTaskManager
- **File**: `shared/notifications/services/BackgroundTaskManager.ts`
- **Purpose**: Manages background task registration and notification scheduling
- **Features**:
  - Automatic background task registration
  - Intelligent notification scheduling (immediate vs background)
  - Persistent storage of scheduled notifications
  - Error handling and logging

### useBackgroundNotifications Hook
- **File**: `shared/notifications/hooks/useBackgroundNotifications.ts`
- **Purpose**: React hook for integrating background notifications in components
- **Features**:
  - Auto-initialization with user preferences
  - App state change monitoring
  - Test notification scheduling
  - Preference updates

### useNotificationPreferences Hook
- **File**: `shared/notifications/hooks/useNotificationPreferences.ts`
- **Purpose**: Manages notification preference persistence
- **Features**:
  - AsyncStorage integration
  - Default preferences
  - Preference validation

## Usage

### 1. Basic Integration

The system is automatically initialized in the `NotificationProvider`:

```tsx
import { NotificationProvider } from '@/shared/notifications';

export default function App() {
  return (
    <NotificationProvider>
      {/* Your app content */}
    </NotificationProvider>
  );
}
```

### 2. Using the Hook

```tsx
import { useBackgroundNotifications } from '@/shared/notifications/hooks/useBackgroundNotifications';

function MyComponent() {
  const {
    isInitialized,
    isProcessing,
    scheduleTestNotification,
    updatePreferences,
    cancelAllNotifications
  } = useBackgroundNotifications();

  const handleTestNotification = async () => {
    await scheduleTestNotification();
  };

  return (
    <button onClick={handleTestNotification}>
      Test Notification
    </button>
  );
}
```

### 3. Manual Scheduling

```tsx
import { BackgroundTaskManager } from '@/shared/notifications/services/BackgroundTaskManager';

const taskManager = BackgroundTaskManager.getInstance();

await taskManager.scheduleNotification({
  id: 'unique-id',
  type: 'reminder',
  scheduledFor: new Date(Date.now() + 60000), // 1 minute from now
  userId: 'user-123',
  title: 'Reminder',
  body: 'This is your reminder!',
  data: { customData: true }
});
```

## Configuration

### Notification Preferences

```typescript
interface NotificationPreferences {
  rhythm: "morning-only" | "evening-only" | "both" | "disabled";
  middayTime: string; // "12:00"
  eveningTimeStart: string; // "18:00"
  eveningTimeEnd: string; // "21:00"
  streaksEnabled: boolean;
  lightTouch: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}
```

### Background Task Settings

- **Task Name**: `CADENCE_NOTIFICATION_TASK`
- **Check Interval**: 15 minutes
- **Storage Key**: `CADENCE_SCHEDULED_NOTIFICATIONS`
- **Threshold**: 30 minutes (short vs long-term scheduling)

## Testing

A test screen is available at `/app/settings/test-notifications.tsx` with features:

- Permission status checking
- Immediate notification sending
- Scheduled notification testing
- Background task verification
- Multiple notification scheduling
- Cancellation testing

## Permissions

The system requires notification permissions:

```typescript
import { useNotifications } from '@/shared/notifications';

const { requestPermissions, permissionStatus } = useNotifications();

if (!permissionStatus.granted) {
  await requestPermissions();
}
```

## Error Handling

All operations are wrapped with comprehensive error handling:

- Failed notifications are logged
- Background task failures are recovered
- Permission issues are handled gracefully
- Network errors are retried automatically

## Platform Support

- **iOS**: Full support with background app refresh
- **Android**: Full support with background processing
- **Web**: Limited to foreground notifications only

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check permissions and background app refresh
2. **Background tasks not running**: Verify device settings allow background processing
3. **Scheduled notifications missing**: Check storage persistence and task registration

### Debugging

Enable debug logging in the NotificationEngine config:

```typescript
const config = {
  enableLogging: true,
  // other config
};
```

### Logs Location

- Console logs during development
- Sentry integration in production
- AsyncStorage for notification history

## Performance

- **Memory Usage**: Minimal, uses singleton patterns
- **Storage Impact**: ~1KB per 100 scheduled notifications
- **Battery Impact**: Minimal, 15-minute background intervals
- **Network Usage**: None for local notifications

## Security

- No sensitive data in notification payloads
- User ID encryption in storage
- Secure token handling for push notifications
- Permission-based access control