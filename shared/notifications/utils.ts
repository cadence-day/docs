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
    const date = new Date();
    const currentDay = date.getDay();
    const daysUntilTarget = (weekday - currentDay + 7) % 7;

    date.setDate(date.getDate() + daysUntilTarget);
    date.setHours(hour, minute, 0, 0);

    return date;
};
