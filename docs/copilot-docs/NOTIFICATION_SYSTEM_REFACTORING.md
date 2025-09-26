# Simplified Notification System Architecture

## Requirements

Create a streamlined notification system with these core features:

### Single Zustand Store (`useNotificationStore`)

- Consolidate all notification logic in `shared/stores/useNotificationsStore.ts`
- Remove `useNotificationStoreIntegration` complexity
- Replace dual store dependencies with single source of truth
- Remove the notification settings from the `useProfileStore` escpecially:

```typescript
notifications: {
    morningReminders: true,
    eveningReminders: false,
    weeklyStreaks: true,
  },
```

### Notification Engine (Singleton)

- One active notification engine instance to prevent duplicates
- Handle both in-app and background notification delivery
- Use push notifications for background, in-app delivery when app is open
- Also allow using Expo Push Notifications. Delivery method is determined by app state (push when background, in-app when foreground)
- Remove one of the NotificationEngine implementations.

### Quote-Based Scheduling

- Schedule notifications using `cadenceMessages` array
- Select **one quote per notification** (not all quotes at scheduled time)
- Only trigger one notification at a time per scheduled time
- Maintain backlog to avoid duplicate quotes until all are used (measure notification engagement if possible on specific quotes, the system can prioritize quotes that drive more engagement but not entirely remove less engaging quotes) - I know there is a contradiction here but it's worth exploring.

### Simplified Architecture

- Remove complex background task intervals
- Direct scheduling without multi-layer abstractions
- Clear permission management in store
- Store is changed and updated directly in the `app/settings/notifications` and it changes the delivery immediately.

## Implementation Design

### Core Store Structure

```typescript
interface NotificationStore {
  // Settings
  preferences: {
    morningReminders: boolean;
    eveningReminders: boolean;
    middayReflection: boolean;
    weeklyStreaks: boolean;
  };
  timing: {
    morningTime: string; // "07:00" -- Add that line in the `app/settings/notifications` component
    middayTime: string; // "12:00"
    eveningTime: string; // "19:00"
  };

  // Permission state
  permissionStatus: "granted" | "denied" | "undetermined";
  isPermissionLoading: boolean;

  // Quote backlog system
  usedQuoteIds: string[];
  nextQuoteIndex: number;

  // Notification engine
  isInApp: boolean; // True when app is open -- This needs to be check upon delivery only.

  // Actions
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  updateTiming: (timing: Partial<NotificationTiming>) => void;
  requestPermissions: () => Promise<boolean>;
  scheduleNotifications: () => Promise<void>;
  getNextQuote: () => CadenceMessage;
  markQuoteUsed: (quoteId: string) => void;
  resetQuoteBacklog: () => void;
  deliverNotification: (quote: CadenceMessage, type: NotificationType) => void;
}
```

### Notification Engine Logic

```typescript
// Singleton notification engine
class NotificationEngine {
  private static instance: NotificationEngine;

  static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  async scheduleQuoteNotification(
    scheduledTime: Date,
    type: NotificationType
  ): Promise<void> {
    const quote = useNotificationStore.getState().getNextQuote();

    if (useNotificationStore.getState().isInApp) {
      // Deliver in-app immediately if time matches
      this.deliverInApp(quote, type);
    } else {
      // Schedule via Expo Push Notification
      await this.scheduleExpoPushNotification(quote, type, scheduledTime);
    }

    useNotificationStore.getState().markQuoteUsed(quote.id);
  }

  private deliverInApp(quote: CadenceMessage, type: NotificationType): void {
    // Show in-app notification/toast with quote
    useNotificationStore.getState().deliverNotification(quote, type);
  }

  private async scheduleExpoPushNotification(
    quote: CadenceMessage,
    type: NotificationType,
    scheduledTime: Date
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getTitleForType(type),
        body: quote.text,
        data: { quoteId: quote.id, type },
      },
      trigger: { date: scheduledTime },
    });
  }
}
```

### Quote Selection Logic

```typescript
// Inside useNotificationStore
getNextQuote: () => {
  const { usedQuoteIds, nextQuoteIndex } = get();
  const availableQuotes = cadenceMessages.filter(
    (quote) => !usedQuoteIds.includes(quote.id)
  );

  // Reset backlog if all quotes used
  if (availableQuotes.length === 0) {
    set({ usedQuoteIds: [], nextQuoteIndex: 0 });
    return cadenceMessages[0];
  }

  // Return next unused quote
  const selectedQuote =
    availableQuotes[nextQuoteIndex % availableQuotes.length];
  set({ nextQuoteIndex: nextQuoteIndex + 1 });

  return selectedQuote;
};
```

## Folder Structure

```
shared/notifications/stores/
  notificationsStore.ts          # Single Zustand store with all logic

shared/notifications/
  NotificationEngine.ts          # Singleton notification engine

shared/notifications/          # Remove existing complex structure
  # Replace with simple components using store directly
  # Keep components in use with the new implementation and remove the others.

shared/notifications/constants/
  CADENCE_MESSAGES.ts            # Quote data source -- coming from shared/cadenceMessages.ts

shared/notifications/services/ # Keep the providers if needed and interesting.
    # e.g., Expo push notification, InApp.

    Remove the locale Notification for now. Only use English.
```

## Key Results

### Simplified Data Flow

- Single store handles all notification state
- Direct access to preferences, timing, and quotes
- No dual store synchronization issues

### Smart Quote Distribution

- One quote per scheduled notification
- Backlog system prevents duplicates until all quotes used
- Automatic reset when all quotes exhausted

### Flexible Delivery

- In-app notifications when app is open
- Background push notifications via Expo
- Singleton engine prevents duplicate scheduling

### Reduced Complexity

- Remove multi-layer hook abstractions
- Direct store operations
- Clear permission management
- Simplified background task handling

## Implementation Priority

1. **Create `shared/notifications/stores/notificationsStore.ts`** with complete Zustand store
2. **Build `NotificationEngine.ts`** singleton with quote scheduling
3. **Update notification components** to use single store
4. **Remove old notification infrastructure**
5. **Test quote rotation and delivery methods**

This architecture eliminates complexity while maintaining all required functionality through a single, well-structured Zustand store and singleton notification engine.
