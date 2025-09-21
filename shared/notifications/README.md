# Notifications System

A comprehensive notification system for React Native apps supporting push, local, and in-app notifications.

## Features

- **Multi-channel delivery**: Push, local, and in-app notifications
- **Internationalization**: Built-in locale support for messages
- **Scheduling**: Schedule notifications for future delivery
- **Preferences**: User-configurable notification preferences
- **Permission management**: Handle notification permissions gracefully

## Architecture

```
NotificationProvider (Context)
    ├── NotificationEngine (Core orchestrator)
    ├── ExpoNotificationProvider (Push/Local via Expo)
    ├── InAppNotificationProvider (In-app messages)
    └── LocaleNotificationProvider (i18n wrapper)
```

## Usage

### Basic Setup

Wrap your app with the NotificationProvider:

```tsx
import { NotificationProvider } from "@/shared/notifications";

export default function App() {
  return (
    <NotificationProvider>
      <YourApp />
    </NotificationProvider>
  );
}
```

### Send a Notification

```tsx
import { useNotifications } from "@/shared/notifications";

function MyComponent() {
  const { sendNotification } = useNotifications();

  const sendWelcomeNotification = async () => {
    await sendNotification({
      id: "welcome-123",
      type: "welcome",
      title: "Welcome to Cadence!",
      body: "Start your mindfulness journey today",
      data: { userId: "123" },
    });
  };

  return <Button onPress={sendWelcomeNotification} title="Send Notification" />;
}
```

### Schedule a Notification

```tsx
const { scheduleNotification } = useNotifications();

// Schedule for tomorrow at 9 AM
const scheduleMorningReminder = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  await scheduleNotification(
    {
      id: "morning-reminder",
      type: "cadence_morning",
      title: "Morning Reflection",
      body: "Take a moment to set your intentions",
    },
    tomorrow
  );
};
```

### Check Permissions

```tsx
const { permissionStatus, requestPermissions } = useNotifications();

useEffect(() => {
  if (!permissionStatus.granted) {
    requestPermissions();
  }
}, []);
```

## Notification Types

- `cadence_morning` - Morning reflection reminders
- `cadence_evening` - Evening reflection reminders
- `streak_achievement` - Streak milestones
- `welcome` - Onboarding messages
- `reminder` - General reminders
