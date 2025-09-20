// Utility functions for creating notifications
// Moved from index.ts to break require cycle

export const createNotificationId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const createScheduledDate = (
    hour: number,
    minute: number,
    daysFromNow = 0,
): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, minute, 0, 0);
    return date;
};

export const createWeeklyScheduledDate = (
    weekday: number,
    hour: number,
    minute: number,
): Date => {
    const now = new Date();
    const currentDay = now.getDay();
    const daysUntilTarget = (weekday - currentDay + 7) % 7;

    // Start with the next occurrence of the target weekday
    const date = new Date(now);
    date.setDate(now.getDate() + daysUntilTarget);
    date.setHours(hour, minute, 0, 0);

    // If the scheduled time is in the past, schedule for the next day (not next week)
    if (date <= now) {
        date.setDate(date.getDate() + 1);
    }

    return date;
};
