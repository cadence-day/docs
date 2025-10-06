import { format, parseISO, zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

/**
 * Convert a UTC date to a local date in the specified timezone
 * @param utcDate - The UTC date to convert
 * @param timezone - The timezone string (e.g., "America/New_York")
 * @returns The date in the specified timezone
 */
export function convertUtcToLocal(utcDate: Date | string, timezone: string): Date {
  const date = typeof utcDate === "string" ? parseISO(utcDate) : utcDate;
  return utcToZonedTime(date, timezone);
}

/**
 * Convert a local date in the specified timezone to UTC
 * @param localDate - The local date to convert
 * @param timezone - The timezone string (e.g., "America/New_York")
 * @returns The date in UTC
 */
export function convertLocalToUtc(localDate: Date | string, timezone: string): Date {
  const date = typeof localDate === "string" ? parseISO(localDate) : localDate;
  return zonedTimeToUtc(date, timezone);
}

/**
 * Format a date for display with timezone information
 * @param date - The date to format
 * @param timezone - The timezone string
 * @param formatString - The format string (default: "yyyy-MM-dd HH:mm:ss zzz")
 * @returns Formatted date string
 */
export function formatDateWithTimezone(
  date: Date | string,
  timezone: string,
  formatString = "yyyy-MM-dd HH:mm:ss zzz"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatString, { timeZone: timezone });
}

/**
 * Get the user's timezone from the device
 * @returns The device's timezone string
 */
export function getDeviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a migration timestamp (UTC) to local time for v2 system
 * @param utcTimestamp - The UTC timestamp from v1 system
 * @param userTimezone - The user's timezone (optional, defaults to device timezone)
 * @returns Object with both UTC and local representations
 */
export function convertMigrationTimestamp(
  utcTimestamp: string,
  userTimezone?: string
): {
  utc: string;
  local: Date;
  localString: string;
  timezone: string;
} {
  const timezone = userTimezone || getDeviceTimezone();
  const utcDate = parseISO(utcTimestamp);
  const localDate = convertUtcToLocal(utcDate, timezone);

  return {
    utc: utcTimestamp,
    local: localDate,
    localString: format(localDate, "yyyy-MM-dd'T'HH:mm:ss"),
    timezone,
  };
}

/**
 * Batch convert timestamps for migration
 * @param timestamps - Array of UTC timestamps
 * @param timezone - The timezone to convert to
 * @returns Array of converted timestamps
 */
export function batchConvertTimestamps(
  timestamps: string[],
  timezone?: string
): Array<{
  original: string;
  converted: Date;
  convertedString: string;
}> {
  const tz = timezone || getDeviceTimezone();

  return timestamps.map((timestamp) => {
    const localDate = convertUtcToLocal(timestamp, tz);
    return {
      original: timestamp,
      converted: localDate,
      convertedString: format(localDate, "yyyy-MM-dd'T'HH:mm:ss"),
    };
  });
}

/**
 * Validate if a timezone string is valid
 * @param timezone - The timezone string to validate
 * @returns boolean indicating if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get timezone offset in hours
 * @param timezone - The timezone string
 * @param date - Optional date to check offset for (defaults to now)
 * @returns The offset in hours
 */
export function getTimezoneOffset(timezone: string, date = new Date()): number {
  const utcDate = zonedTimeToUtc(date, "UTC");
  const tzDate = utcToZonedTime(utcDate, timezone);
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}