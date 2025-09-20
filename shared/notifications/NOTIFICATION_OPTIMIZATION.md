# Notification System: Functional Analysis & Optimization

## Core Functionality Analysis

The Cadence notification system handles three key functions:

1. **Notification Management**
   - Sends in-app, local, and push notifications
   - Central engine emits events for subscribers
   - Handles permissions and token management

2. **Scheduling Logic**
   - Time-based triggers for midday/evening reflections
   - Adaptive scheduling based on user preferences
   - Weekly streak reminders with activity-based logic

3. **User Preferences**
   - Controls notification rhythm (morning-only, evening-only, both, disabled)
   - Customizable notification times
   - Configurable tone (light touch vs standard)
   - Streak notification preferences

## Optimization Opportunities

### 1. Optimize Data Fetching

```typescript
// CURRENT: Multiple database calls per day checked
export const calculateLoggingStreak = async (user_id: string): Promise<number> => {
    let streak = 0;
    // Loops through days, making a separate query for EACH day
    for (let i = 0; i < 30; i++) {
        const timeslices = await getTimeslicesForUser({...});
        // ...processing
    }
    return streak;
};

// OPTIMIZED: Single query for all relevant data
export const calculateLoggingStreak = async (user_id: string): Promise<number> => {
    // Get all data for past 30 days in ONE query
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    const allTimeslices = await getTimeslicesForUserRange({
        user_id,
        from: startDate,
        to: new Date()
    });

    // Process locally with in-memory data
    const timeslicesByDay = groupTimeslicesByDay(allTimeslices);

    // Calculate streak from processed data
    let streak = 0;
    const today = new Date().setHours(0,0,0,0);

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = formatDateKey(checkDate);

        if (timeslicesByDay[dateKey]?.length > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
};
```

### 2. Batch Notification Scheduling

```typescript
// OPTIMIZED: Unified scheduling for efficiency
async scheduleCadenceNotifications(preferences, user_id) {
    try {
        // Cancel any existing notifications first
        await this.cancelCadenceNotifications();

        if (preferences.rhythm === "disabled") return;

        // Build consolidated notification plan
        const notificationPlan = [];

        // Add midday reflections if enabled
        if (preferences.rhythm === "morning-only" || preferences.rhythm === "both") {
            const [hour, minute] = preferences.middayTime.split(":").map(Number);
            notificationPlan.push({
                type: "midday-reflection",
                hour,
                minute,
                message: this.getMiddayMessage(preferences),
                id: "midday-reflection"
            });
        }

        // Add evening reflections if enabled
        if (preferences.rhythm === "evening-only" || preferences.rhythm === "both") {
            const [startHour, startMinute] = preferences.eveningTimeStart.split(":").map(Number);
            notificationPlan.push({
                type: "evening-reflection",
                hour: startHour,
                minute: startMinute,
                message: this.getEveningMessage(preferences),
                id: "evening-reflection"
            });
        }

        // Add streak reminder if enabled
        if (preferences.streaksEnabled) {
            const shouldShow = await shouldShowStreakNotification(user_id);
            if (shouldShow) {
                // Schedule for Sunday evening
                const streak = await calculateLoggingStreak(user_id);
                notificationPlan.push({
                    type: "streak-reminder",
                    hour: 19,
                    minute: 0,
                    weekday: 0, // Sunday
                    message: this.getStreakMessage(preferences, streak),
                    id: "streak-reminder"
                });
            }
        }

        // Execute the plan with batch scheduling
        await this.batchScheduleNotifications(notificationPlan, user_id);

    } catch (error) {
        console.error("[scheduleCadenceNotifications] Error:", error);
    }
}
```

### 3. Memoization for Expensive Operations

```typescript
// In NotificationContext.tsx:

// Memoize expensive permission operations
const requestPermission = useCallback(async () => {
  // Implementation
}, []);

// Memoize notification settings derivation
const derivedSettings = useMemo(() => {
  return {
    hasCompletedSetup: Boolean(settings.enabled && settings.expoPushToken),
    isDisabled: settings.cadencePreferences?.rhythm === "disabled",
    // Other derived values
  };
}, [
  settings.enabled,
  settings.expoPushToken,
  settings.cadencePreferences?.rhythm,
]);

// Memoize subscription status checking
const checkSubscriptionStatus = useCallback(async () => {
  // Implementation
}, [profile?.user_id]);
```

### 4. Context Optimization

```typescript
// Split context for more granular updates
const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined);
const NotificationActionsContext = createContext<NotificationActionsContextType | undefined>(undefined);

export const NotificationProvider = ({ children }) => {
    // State and implementations

    const settingsValue = useMemo(() => ({
        settings,
        derivedSettings,
    }), [settings, derivedSettings]);

    const actionsValue = useMemo(() => ({
        setSettings,
        requestPermission,
        subscribeToCadenceNotifications,
        // Other actions
    }), [/* dependencies */]);

    return (
        <NotificationSettingsContext.Provider value={settingsValue}>
            <NotificationActionsContext.Provider value={actionsValue}>
                {children}
            </NotificationActionsContext.Provider>
        </NotificationSettingsContext.Provider>
    );
};

// Consumer hooks for specific needs
export const useNotificationSettings = () => useContext(NotificationSettingsContext);
export const useNotificationActions = () => useContext(NotificationActionsContext);
```

### 5. Unified Error Handling

```typescript
// Notification-specific error handler
const handleNotificationError = (
  operation: string,
  error: any,
  metadata?: Record<string, any>
) => {
  // Log error with consistent format
  console.error(`[Notification] ${operation} failed:`, error);

  // Categorize errors
  if (error.code === "permission-denied") {
    // Handle permission errors
    return { type: "permission", message: "Permission required" };
  }

  if (error.code === "network-error") {
    // Handle network errors, maybe retry
    return { type: "network", message: "Network unavailable", retryable: true };
  }

  // Default error handling
  return { type: "unknown", message: error.message || "Unknown error" };
};

// Usage in notification methods
try {
  // Operation
} catch (error) {
  const errorResult = handleNotificationError(
    "scheduleCadenceNotifications",
    error,
    { user_id }
  );
  if (errorResult.retryable) {
    // Maybe add retry logic
  }
}
```

## Implementation Priorities

When migrating to a shared implementation, prioritize:

1. **Data efficiency**: Implement the optimized data fetching pattern first
2. **Subscription management**: Ensure clean subscription/unsubscription to prevent memory leaks
3. **Batch scheduling**: Consolidate notification scheduling logic
4. **Context optimization**: Split contexts and implement memoization
5. **Error handling**: Create unified error handling system

This approach focuses on the core logic and performance optimizations rather than file structure, making it more adaptable for migration to a shared folder in a new codebase.

## Use locales for notification messages

Ensure all user-facing strings in notifications are localized using the app's i18n system. This includes messages for reflections, streak reminders, and any error notifications.

## Supabase

- Create a Supabase notification table under the internal schema to log notification events, statuses, and user preferences (notification + languages, and timezones and period of day preferences) and also add expo push tokens on that table which also has a user_id coming from Clerk.
