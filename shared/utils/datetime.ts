// Default values when device settings are not available
import { GlobalErrorHandler } from "./errorHandler";
import { getSafeLocale } from "./locale";
export type DateTimePreferences = {
  timezone: string;
  locale: string;
  dateFormat: string;
  timeFormat: "12h" | "24h" | "12" | "24";
};
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
export type DateTimePreferences = {
    timezone: string;
    locale: string;
    dateFormat: string;
    timeFormat: "12h" | "24h" | "12" | "24";
};
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DEFAULT_LOCALE = "en-US";
const DEFAULT_DATE_FORMAT = "MM/dd/yyyy";
const DEFAULT_TIME_FORMAT = "24h";

    timezone: string;
    locale: string;
    dateFormat: string;
    timeFormat: "12h" | "24h" | "12" | "24";
}

/**
 * Gets the device's current timezone
 * @returns Device timezone string
 */
export const getDeviceTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    GlobalErrorHandler.logWarning(
      "Could not detect device timezone, using default",
      "getDeviceTimezone",
      { defaultTimezone: DEFAULT_TIMEZONE, error }
    );
    return DEFAULT_TIMEZONE;
  }
};

/**
 * Validates if a timezone is valid, returns default if invalid
 * @param timezone - Timezone to validate
 * @returns Valid timezone string
 */
export const getValidTimezone = (timezone: string): string => {
  try {
    // Test if timezone is valid by creating a DateTimeFormat
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch (error) {
    GlobalErrorHandler.logWarning(
      `Invalid timezone "${timezone}", falling back to device timezone`,
      "getValidTimezone",
      { timezone, error }
    );
    return getDeviceTimezone();
  }
};

/**
 * Checks if user's timezone differs from device timezone
 * @param userTimezone - User's stored timezone
 * @returns Object with comparison result and timezones
 */
export const compareTimezones = (
  userTimezone: string | null | undefined
): {
  isDifferent: boolean;
  deviceTimezone: string;
  userTimezone: string | null;
  validUserTimezone: string;
} => {
  const deviceTimezone = getDeviceTimezone();
  const validUserTimezone = userTimezone
    ? getValidTimezone(userTimezone)
    : deviceTimezone;

  return {
    isDifferent: validUserTimezone !== deviceTimezone,
    deviceTimezone,
    userTimezone: userTimezone || null,
    validUserTimezone,
  };
};

/**
 * Gets device-based datetime preferences
 * @returns DateTimePreferences object based on device settings
 */
export const getDateTimePreferences = (): DateTimePreferences => {
  return getDeviceDateTimePreferences();
};

/**
 * Gets the device's current locale or returns a default
 * @returns Device locale string
 */
const getDeviceLocale = (): string => {
  try {
    // Get device locale from Intl API
    const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    return getSafeLocale(deviceLocale);
  } catch (error) {
    GlobalErrorHandler.logWarning(
      "Could not detect device locale, using default: en-US",
      "getDeviceLocale",
      { error }
    );
    return "en-US";
  }
};

/**
 * Converts a UTC date to local timezone for display
 * @param utcDate - Date in UTC timezone
 * @returns Date in local timezone
 */
export const utcToLocal = (utcDate: Date): Date => {
  const safeDate = createSafeDate(utcDate);
  return new Date(safeDate.getTime() - safeDate.getTimezoneOffset() * 60000);
};

/**
 * Converts a UTC date to a specific timezone
 * @param utcDate - Date in UTC timezone
 * @param timezone - Target timezone (e.g., "America/New_York")
 * @returns Date adjusted for the target timezone
 */
export const utcToTimezone = (utcDate: Date, timezone: string): Date => {
  try {
    // Validate timezone first
    const validTimezone = getValidTimezone(timezone);

    // Create a formatter for the target timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: validTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(utcDate);
    const year = parseInt(parts.find((p) => p.type === "year")?.value || "0");
    const month =
      parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1;
    const day = parseInt(parts.find((p) => p.type === "day")?.value || "1");
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const minute = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0"
    );
    const second = parseInt(
      parts.find((p) => p.type === "second")?.value || "0"
    );

    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    GlobalErrorHandler.logError(error, "utcToTimezone", { timezone });
    // Fallback to local timezone conversion
    return utcToLocal(utcDate);
  }
};

/**
 * Converts a timezone-specific date to UTC
 * @param timezoneDate - Date in specific timezone
 * @param timezone - Source timezone (e.g., "America/New_York")
 * @returns Date in UTC timezone
 */
export const timezoneToUtc = (timezoneDate: Date, timezone: string): Date => {
  // Get the timezone offset for the given date and timezone
  const utcTime = timezoneDate.getTime();
  const offsetInMs = getTimezoneOffset(timezoneDate, timezone);

  return new Date(utcTime - offsetInMs);
};

/**
 * Gets timezone offset in milliseconds for a specific date and timezone
 * @param date - The date to check
 * @param timezone - The timezone to check
 * @returns Offset in milliseconds
 */
export const getTimezoneOffset = (date: Date, timezone: string): number => {
  const utcDate = new Date(date.toISOString());
  const targetDate = new Date(
    date.toLocaleString("en-US", { timeZone: timezone })
  );
  return targetDate.getTime() - utcDate.getTime();
};

/**
 * Parses user date format string and returns component order and formatting
 * @param dateFormat - User's date format string (e.g., "DD/MM/YYYY", "MM/dd/yyyy")
 * @returns Object with component order and padding info
 */
const parseDateFormat = (
  dateFormat: string
): {
  order: Array<"day" | "month" | "year">;
  dayPadding: boolean;
  monthPadding: boolean;
  separator: string;
} => {
  const format = dateFormat.toUpperCase();
  const order: Array<"day" | "month" | "year"> = [];

  // Find the order of components
  const dayIndex = Math.min(format.indexOf("DD"), format.indexOf("D"));
  const monthIndex = Math.min(format.indexOf("MM"), format.indexOf("M"));
  const yearIndex = Math.min(format.indexOf("YYYY"), format.indexOf("YY"));

  const positions = [
    { type: "day" as const, index: dayIndex >= 0 ? dayIndex : Infinity },
    {
      type: "month" as const,
      index: monthIndex >= 0 ? monthIndex : Infinity,
    },
    { type: "year" as const, index: yearIndex >= 0 ? yearIndex : Infinity },
  ].sort((a, b) => a.index - b.index);

  positions.forEach((pos) => {
    if (pos.index !== Infinity) {
      order.push(pos.type);
    }
  });

  // Determine padding (DD vs D, MM vs M)
  const dayPadding = format.includes("DD");
  const monthPadding = format.includes("MM");

  // Find separator (most common non-alphanumeric character)
  const separators = dateFormat.match(/[^DMYdmy]/g) || [];
  const separator = separators.length > 0 ? separators[0] || "/" : "/";

  return { order, dayPadding, monthPadding, separator };
};

/**
 * Formats a date according to user's custom date format
 * @param date - Date to format
 * @param dateFormat - User's date format string
 * @returns Formatted date string
 */
const formatDateWithCustomFormat = (date: Date, dateFormat: string): string => {
  const { order, dayPadding, monthPadding, separator } =
    parseDateFormat(dateFormat);

  const day = dayPadding
    ? date.getDate().toString().padStart(2, "0")
    : date.getDate().toString();
  const month = monthPadding
    ? (date.getMonth() + 1).toString().padStart(2, "0")
    : (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();

  const components: Record<string, string> = {
    day,
    month,
    year,
  };

  return order.map((component) => components[component]).join(separator);
};

/**
 * Formats a UTC date for display using device preferences
 * @param utcDateString - UTC date as ISO string
 * @param preferences - DateTimePreferences (optional, uses device if not provided)
 * @param includeTime - Whether to include time in the formatted output
 * @returns Formatted date string
 */
export const formatDateForDisplay = (
  utcDateString: string,
  preferences?: DateTimePreferences,
  includeTime: boolean = false
): string => {
  try {
    const prefs = preferences || getDeviceDateTimePreferences();
    const utcDate = new Date(utcDateString);
    const displayDate = utcToTimezone(utcDate, prefs.timezone);

    // Use custom date formatting based on device date format
    let dateString = formatDateWithCustomFormat(displayDate, prefs.dateFormat);

    if (includeTime) {
      const is12Hour = prefs.timeFormat === "12h" || prefs.timeFormat === "12";
      const timeString = displayDate.toLocaleTimeString(prefs.locale, {
        timeZone: getValidTimezone(prefs.timezone),
        hour: "2-digit",
        minute: "2-digit",
        hour12: is12Hour,
      });
      dateString += ` ${timeString}`;
    }

    return dateString;
  } catch (error) {
    GlobalErrorHandler.logError(error, "formatDateForDisplay", {
      utcDateString,
    });
    // Fallback to simple date string
    return new Date(utcDateString).toLocaleDateString();
  }
};

/**
 * Formats a UTC time for display using device preferences
 * @param utcDateString - UTC date as ISO string
 * @param preferences - DateTimePreferences (optional, uses device if not provided)
 * @returns Formatted time string
 */
export const formatTimeForDisplay = (
  utcDateString: string,
  preferences?: DateTimePreferences
): string => {
  try {
    const prefs = preferences || getDeviceDateTimePreferences();
    const utcDate = new Date(utcDateString);
    const displayDate = utcToTimezone(utcDate, prefs.timezone);

    // Handle different time format values: "12h", "12", "24h", "24"
    const is12Hour = prefs.timeFormat === "12h" || prefs.timeFormat === "12";

    return displayDate.toLocaleTimeString(prefs.locale, {
      timeZone: getValidTimezone(prefs.timezone),
      hour: "2-digit",
      minute: "2-digit",
      hour12: is12Hour,
    });
  } catch (error) {
    GlobalErrorHandler.logError(error, "formatTimeForDisplay", {
      utcDateString,
    });
    // Fallback to simple time string
    return new Date(utcDateString).toLocaleTimeString();
  }
};

/**
 * Gets a short weekday name for a date
 * @param utcDateString - UTC date as ISO string
 * @param preferences - DateTimePreferences (optional, uses device if not provided)
 * @returns Short weekday name (e.g., "Mon", "Tue")
 */
export const getWeekdayShort = (
  utcDateString: string,
  preferences?: DateTimePreferences
): string => {
  try {
    const prefs = preferences || getDeviceDateTimePreferences();
    const utcDate = new Date(utcDateString);
    const displayDate = utcToTimezone(utcDate, prefs.timezone);

    return displayDate.toLocaleDateString(prefs.locale, {
      weekday: "short",
    });
  } catch (error) {
    GlobalErrorHandler.logError(error, "getWeekdayShort", { utcDateString });
    return new Date(utcDateString).toLocaleDateString("en-US", {
      weekday: "short",
    });
  }
};

/**
 * Gets a full weekday name for a date
 * @param utcDateString - UTC date as ISO string
 * @param preferences - DateTimePreferences (optional, uses device if not provided)
 * @returns Full weekday name (e.g., "Monday", "Tuesday")
 */
export const getWeekdayFull = (
  utcDateString: string,
  preferences?: DateTimePreferences
): string => {
  try {
    const prefs = preferences || getDeviceDateTimePreferences();
    const utcDate = new Date(utcDateString);
    const displayDate = utcToTimezone(utcDate, prefs.timezone);

    return displayDate.toLocaleDateString(prefs.locale, {
      weekday: "long",
    });
  } catch (error) {
    GlobalErrorHandler.logError(error, "getWeekdayFull", { utcDateString });
    return new Date(utcDateString).toLocaleDateString("en-US", {
      weekday: "long",
    });
  }
};

/**
 * Gets weekday name for a date in specified format
 * @param utcDateString - UTC date as ISO string
 * @param preferences - DateTimePreferences (optional, uses device if not provided)
 * @param format - Weekday format: "short" | "long" | "narrow"
 * @returns Weekday name in specified format
 */
export const getWeekday = (
  utcDateString: string,
  preferences?: DateTimePreferences,
  format: "short" | "long" | "narrow" = "short"
): string => {
  try {
    const prefs = preferences || getDeviceDateTimePreferences();
    const utcDate = new Date(utcDateString);
    const displayDate = utcToTimezone(utcDate, prefs.timezone);

    return displayDate.toLocaleDateString(prefs.locale, {
      weekday: format,
    });
  } catch (error) {
    GlobalErrorHandler.logError(error, `getWeekday:${format}`, {
      utcDateString,
    });
    return new Date(utcDateString).toLocaleDateString("en-US", {
      weekday: format,
    });
  }
};

/**
 * Checks if a UTC timestamp falls within the current local time slot (30-minute intervals)
 * @param utcTimestamp - UTC timestamp as string
 * @param timezone - Timezone (optional, uses device if not provided)
 * @returns True if the timestamp represents the current time slot
 */
export const isCurrentTimeSlot = (
  utcTimestamp: string,
  timezone?: string
): boolean => {
  const tz = timezone || getDeviceTimezone();
  const now = new Date();
  const utcDate = new Date(utcTimestamp);
  const localDate = utcToTimezone(utcDate, tz);

  // Check if current time falls within this 30-minute slot
  const slotEndTime = new Date(localDate.getTime() + 30 * 60 * 1000);

  return now >= localDate && now < slotEndTime;
};

/**
 * Safely creates a date from various input types
 * @param input - Date input (Date, string, or number)
 * @returns Valid Date object or throws error
 */
export const createSafeDate = (input: Date | string | number): Date => {
  let date: Date;

  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "string") {
    date = new Date(input);
  } else if (typeof input === "number") {
    date = new Date(input);
  } else {
    throw new Error(`Invalid date input type: ${typeof input}`);
  }

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${input}`);
  }

  // Check for date boundaries that might cause issues
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    throw new Error(`Date year out of reasonable bounds: ${year}`);
  }

  return date;
};

/**
 * Legacy compatibility functions - these maintain the existing API
 * but use the new timezone-aware logic internally
 */

/**
 * @deprecated Use utcToLocal instead
 */
export const utcToLocalDate = utcToLocal;

/**
 * @deprecated Use formatDateForDisplay instead
 */
export const utcToLocalDateString = (utcDateString: string): string => {
  return formatDateForDisplay(utcDateString, undefined, false);
};

/**
 * Formats a UTC date with weekday for display using device preferences
 * @param utcDateString - UTC date as ISO string
 * @param preferences - DateTimePreferences (optional, uses device if not provided)
 * @param options - Formatting options
 * @returns Formatted date string with weekday
 */
export const formatDateWithWeekday = (
  utcDateString: string,
  preferences?: DateTimePreferences,
  options: {
    weekdayFormat?: "short" | "long" | "narrow";
    includeTime?: boolean;
    weekdayPosition?: "before" | "after";
    dateTimeSeparator?: string;
  } = {}
): string => {
  const {
    weekdayFormat = "short",
    includeTime = false,
    weekdayPosition = "before",
    dateTimeSeparator = " ",
  } = options;

  try {
    const prefs = preferences || getDeviceDateTimePreferences();
    const utcDate = new Date(utcDateString);
    const displayDate = utcToTimezone(utcDate, prefs.timezone);

    // Get weekday name
    const weekday = displayDate.toLocaleDateString(prefs.locale, {
      weekday: weekdayFormat,
    });

    // Get formatted date
    let dateString = formatDateWithCustomFormat(displayDate, prefs.dateFormat);

    if (includeTime) {
      const is12Hour = prefs.timeFormat === "12h" || prefs.timeFormat === "12";
      const timeString = displayDate.toLocaleTimeString(prefs.locale, {
        timeZone: getValidTimezone(prefs.timezone),
        hour: "2-digit",
        minute: "2-digit",
        hour12: is12Hour,
      });
      dateString += `${dateTimeSeparator}${timeString}`;
    }
    // Combine weekday and date with a comma separator
    return weekdayPosition === "before"
      ? `${weekday}, ${dateString}`
      : `${dateString}, ${weekday}`;
  } catch (error) {
    GlobalErrorHandler.logError(error, "formatDateWithWeekday", {
      utcDateString,
    });
    // Fallback to simple date string
    return new Date(utcDateString).toLocaleDateString();
  }
};

/**
 * Centralized time formatting function with null safety and fallback handling
 * @param date - Date to format (string, Date, or null/undefined)
 * @param preferences - User datetime preferences (optional, uses defaults if not provided)
 * @param fallback - Fallback string to display if date is null/invalid (default: "--:--")
 * @returns Formatted time string
 */
export const formatTime = (
  date: string | Date | null | undefined,
  preferences?: DateTimePreferences,
  fallback: string = "--:--"
): string => {
  // Handle null/undefined dates
  if (!date) return fallback;

  try {
    // Convert to ISO string if it's a Date object
    const dateString = date instanceof Date ? date.toISOString() : date;

    // Use provided preferences or fallback to defaults
    const prefs = preferences || {
      locale: getSafeLocale(undefined),
      timezone: getDeviceTimezone(),
      timeFormat: "24h" as const,
      dateFormat: "MM/dd/yyyy",
    };

    return formatTimeForDisplay(dateString, prefs);
  } catch (error) {
    GlobalErrorHandler.logError(error, "formatTime", { date });
    return fallback;
  }
};

/**
 * Gets comprehensive device-based datetime preferences as a fallback
 * This is used when user preferences are completely unavailable
 * @returns DateTimePreferences object based on device settings
 */
export const getDeviceDateTimePreferences = (): DateTimePreferences => {
  const deviceTimezone = getDeviceTimezone();
  const deviceLocale = getDeviceLocale();

  // Determine default time format based on device locale
  const timeFormat = deviceLocale.startsWith("en-US") ? "12h" : "24h";

  // Determine default date format based on device locale
  const dateFormat = deviceLocale.startsWith("en-US")
    ? "MM/dd/yyyy"
    : "dd/MM/yyyy";

  return {
    timezone: deviceTimezone,
    locale: getSafeLocale(deviceLocale),
    dateFormat,
    timeFormat,
  };
};
