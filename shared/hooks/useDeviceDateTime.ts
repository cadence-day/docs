import { useMemo } from "react";

import i18n, { availableLanguages, locale } from "@/shared/locales";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

/**
 * Preferences discovered from the device/runtime Intl environment.
 * - locale: the resolved locale string (may be an IETF tag)
 * - timezone: IANA time zone name (if available)
 * - timeFormat: a loose hint such as '12h'|'24h' or undefined
 */
export type DateTimePreferences = {
  locale?: string;
  timezone?: string;
  timeFormat?: string;
  dateFormat?: string;
};

/**
 * Small helper that resolves the preferred locale (favoring app `locale`
 * when it maps to a supported language) and the device timeZone from
 * Intl.resolvedOptions. Returns { preferredLocale, timeZone, resolved }.
 */
const resolveLocaleAndTimeZone = () => {
  const resolved =
    typeof Intl !== "undefined"
      ? (Intl.DateTimeFormat().resolvedOptions() as any)
      : {};
  const deviceLocale = resolved.locale || resolved.localeMatcher || undefined;
  const code =
    typeof locale === "string"
      ? String(locale).split(/[-_]/)[0].toLowerCase()
      : null;
  const preferredLocale =
    code && availableLanguages.includes(code)
      ? locale
      : deviceLocale || undefined;
  const timeZone = resolved.timeZone || undefined;
  return { preferredLocale, timeZone, resolved };
};

/**
 * Probe the runtime Intl to produce a compact DateTimePreferences object.
 */
export const getDeviceDateTimePreferences = (): DateTimePreferences => {
  try {
    const { preferredLocale, timeZone, resolved } = resolveLocaleAndTimeZone();
    const hour12 =
      typeof resolved.hour12 === "boolean" ? resolved.hour12 : undefined;
    const timeFormat =
      hour12 === true ? "12h" : hour12 === false ? "24h" : undefined;
    GlobalErrorHandler.logDebug("getDeviceDateTimePreferences", "DATETIME", {
      preferredLocale,
      timeZone,
      timeFormat,
      resolved,
    });
    return { locale: preferredLocale, timezone: timeZone, timeFormat };
  } catch (err) {
    try {
      GlobalErrorHandler.logError(err, "getDeviceDateTimePreferences", {});
    } catch (_) {}
    return { locale: locale, timeFormat: undefined };
  }
};

/**
 * Format a time portion using device/app preferences.
 * - utcDate: input Date or ISO string
 * - prefs: optional preferences hint (from getDeviceDateTimePreferences)
 * - options: hour/minute format hints
 */
export const formatTimeForDisplay = (
  utcDate: string | Date,
  prefs?: DateTimePreferences | null,
  options: { hour?: string; minute?: string } = {
    hour: "numeric",
    minute: "2-digit",
  }
): string => {
  try {
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
    const { preferredLocale, timeZone, resolved } = resolveLocaleAndTimeZone();

    const localeToUse = preferredLocale || undefined;
    const timeZoneToUse = (prefs && prefs.timezone) || timeZone || undefined;

    // Determine hour12: prefer explicit prefs, then resolved, then probe via toLocaleTimeString
    let hour12: boolean | undefined = undefined;
    if (prefs && typeof prefs.timeFormat === "string")
      hour12 = prefs.timeFormat.startsWith("12");
    else if (resolved && typeof resolved.hour12 === "boolean")
      hour12 = resolved.hour12;
    else {
      try {
        hour12 = /AM|PM|am|pm/.test(
          date.toLocaleTimeString(localeToUse as any)
        );
      } catch {
        hour12 = undefined;
      }
    }

    return new Intl.DateTimeFormat(localeToUse as any, {
      hour: (options.hour as "numeric" | "2-digit") || "numeric",
      minute: (options.minute as "numeric" | "2-digit") || "2-digit",
      hour12,
      timeZone: timeZoneToUse,
    }).format(date);
  } catch (error) {
    try {
      GlobalErrorHandler.logError(error, "formatTimeForDisplay", {
        utcDate,
        prefs,
      });
    } catch (_) {}
    try {
      return new Date(
        typeof utcDate === "string" ? utcDate : utcDate.toString()
      ).toLocaleTimeString();
    } catch {
      return "";
    }
  }
};

/**
 * Format a date with a weekday and optional time. Weekday is capitalized.
 * - includeTime: if true, appends localized preposition + time
 */
export const formatDateWithWeekday = (
  utcDate: string | Date = new Date(),
  prefs?: DateTimePreferences | null,
  options: {
    weekdayFormat?: "short" | "long" | "narrow";
    monthFormat?: "short" | "long" | "narrow";
    includeTime?: boolean;
    weekdayPosition?: "before" | "after";
    dateTimeSeparator?: string;
    includeYear?: boolean;
  } = {}
): string => {
  const {
    weekdayFormat = "short",
    monthFormat = "short",
    includeTime = false,
    weekdayPosition = "before",
    dateTimeSeparator = " ",
    includeYear = true,
  } = options;
  try {
    const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate;
    const { preferredLocale, timeZone } = resolveLocaleAndTimeZone();

    let weekday = new Intl.DateTimeFormat(preferredLocale as any, {
      weekday: weekdayFormat,
    }).format(date);
    if (weekday && weekday.length)
      weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

    const dateString = new Intl.DateTimeFormat(preferredLocale as any, {
      year: includeYear ? "numeric" : undefined,
      month: monthFormat,
      day: "numeric",
      timeZone,
    }).format(date);

    let result =
      weekdayPosition === "before"
        ? `${weekday}, ${dateString}`
        : `${dateString}, ${weekday}`;

    if (includeTime) {
      const timeString = formatTimeForDisplay(date, prefs);
      let preposition = "at";
      try {
        const t = i18n.t("dateTime.preposition");
        if (t && typeof t === "string") preposition = t;
      } catch {}
      const sep = dateTimeSeparator || " ";
      result =
        weekdayPosition === "before"
          ? `${weekday}, ${dateString}${sep}${preposition}${sep}${timeString}`
          : `${dateString}${sep}${preposition}${sep}${timeString}, ${weekday}`;
    }
    return result;
  } catch (error) {
    try {
      GlobalErrorHandler.logError(error, "formatDateWithWeekday", {
        utcDate,
        prefs,
        options,
      });
    } catch (_) {}
    try {
      return new Date(
        typeof utcDate === "string" ? utcDate : utcDate.toString()
      ).toLocaleDateString();
    } catch {
      return "";
    }
  }
};

/**
 * Hook exposing device date/time preferences and simple formatting helpers.
 * - prefs: the detected device preferences
 * - formatDate: localized date with weekday
 * - formatTime: localized time string
 * - displayDateTime: single-string combined date+time (uses localized preposition)
 */
export const useDeviceDateTime = () => {
  const prefs: DateTimePreferences = useMemo(() => {
    try {
      return getDeviceDateTimePreferences();
    } catch (err) {
      // If the probe fails, return a sensible fallback
      return { locale: undefined, timezone: undefined, timeFormat: undefined };
    }
  }, []);

  const formatDate = (
    date: string | Date = new Date(),
    options: {
      weekdayFormat?: "short" | "long" | "narrow";
      monthFormat?: "short" | "long" | "narrow";
      includeTime?: boolean;
      weekdayPosition?: "before" | "after";
      dateTimeSeparator?: string;
      includeYear?: boolean;
    } = {}
  ) => {
    return formatDateWithWeekday(date, prefs, options);
  };

  // Returns the separator string to use around the localized preposition.
  // We keep this as a single space by default; callers pass this into
  // formatDate's `dateTimeSeparator` so the formatter inserts the
  // localized preposition with the provided spacing.
  const getDateTimeSeparator = () => {
    return " ";
  };

  /**
   * Returns date and time parts plus a localized preposition and a full combined string.
   * Useful for UI that needs to render the date and time separately (e.g. to style AM/PM).
   */
  const displayDateTime = (
    date: string | Date = new Date(),
    options: {
      weekdayFormat?: "short" | "long" | "narrow";
      monthFormat?: "short" | "long" | "narrow";
      weekdayPosition?: "before" | "after";
      dateTimeSeparator?: string;
      includeTime?: boolean;
    } = {}
  ) => {
    const sep = options.dateTimeSeparator ?? getDateTimeSeparator();

    // Date part without time
    const datePart = formatDate(date, {
      weekdayFormat: options.weekdayFormat,
      weekdayPosition: options.weekdayPosition,
      monthFormat: options.monthFormat,
      includeTime: false,
      dateTimeSeparator: sep,
      includeYear: false,
    });

    if (!options.includeTime) {
      return datePart;
    }

    // Time part
    const timePart = formatTime(date);

    // localized preposition (e.g., 'at' / 'kl.')
    let preposition = "at";
    try {
      const t = i18n.t("dateTime.preposition");
      if (t && typeof t === "string") preposition = t;
    } catch {
      // ignore
    }

    const full = `${datePart}${sep}${preposition}${sep}${timePart}`;
    return full;
  };

  const formatTime = (
    date: string | Date = new Date(),
    options: { hour?: string; minute?: string } = {
      hour: "numeric",
      minute: "2-digit",
    }
  ) => {
    return formatTimeForDisplay(date, prefs, options);
  };

  return {
    prefs,
    formatDate,
    formatTime,
    getDateTimeSeparator,
    displayDateTime,
  } as const;
};

export default useDeviceDateTime;
