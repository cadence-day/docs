/**
 * Date and Time formatting utilities
 */

import { GlobalErrorHandler } from "./errorHandler";

export interface DateTimeFormatOptions {
    locale?: string;
    dateFormat?: "short" | "long" | "numeric";
    timeFormat?: "short" | "long" | "numeric";
    separator?: string;
}

/**
 * Formats a date and time in a readable format
 * @param dateInput - Date string, Date object, or null/undefined
 * @param options - Formatting options
 * @returns Formatted date and time string or empty string if invalid
 */
export const formatDateTime = (
    dateInput: string | Date | null | undefined,
    options: DateTimeFormatOptions = {},
): string => {
    const {
        locale = "en-GB",
        dateFormat = "short",
        timeFormat = "short",
        separator = " at ",
    } = options;

    if (!dateInput) return "";

    try {
        const date = typeof dateInput === "string"
            ? new Date(dateInput)
            : dateInput;

        if (isNaN(date.getTime())) {
            return "";
        }

        // Date formatting options
        const dateFormatOptions: Intl.DateTimeFormatOptions = {};
        switch (dateFormat) {
            case "short":
                dateFormatOptions.day = "2-digit";
                dateFormatOptions.month = "2-digit";
                dateFormatOptions.year = "2-digit";
                break;
            case "long":
                dateFormatOptions.day = "numeric";
                dateFormatOptions.month = "long";
                dateFormatOptions.year = "numeric";
                break;
            case "numeric":
                dateFormatOptions.day = "numeric";
                dateFormatOptions.month = "numeric";
                dateFormatOptions.year = "numeric";
                break;
        }

        // Time formatting options
        const timeFormatOptions: Intl.DateTimeFormatOptions = {};
        switch (timeFormat) {
            case "short":
                timeFormatOptions.hour = "2-digit";
                timeFormatOptions.minute = "2-digit";
                break;
            case "long":
                timeFormatOptions.hour = "2-digit";
                timeFormatOptions.minute = "2-digit";
                timeFormatOptions.second = "2-digit";
                break;
            case "numeric":
                timeFormatOptions.hour = "numeric";
                timeFormatOptions.minute = "numeric";
                break;
        }

        const dateStr = date.toLocaleDateString(locale, dateFormatOptions);
        const timeStr = date.toLocaleTimeString(locale, timeFormatOptions);

        return `${dateStr}${separator}${timeStr}`;
    } catch (error) {
        GlobalErrorHandler.logWarning(
            "Error formatting date/time",
            "formatDateTime",
            { dateInput, options, error },
        );
        return "";
    }
};

/**
 * Formats just the date part
 * @param dateInput - Date string, Date object, or null/undefined
 * @param locale - Locale string (default: "en-GB")
 * @param format - Format type (default: "short")
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (
    dateInput: string | Date | null | undefined,
    locale: string = "en-GB",
    format: "short" | "long" | "numeric" = "short",
): string => {
    if (!dateInput) return "";

    try {
        const date = typeof dateInput === "string"
            ? new Date(dateInput)
            : dateInput;

        if (isNaN(date.getTime())) {
            return "";
        }

        const options: Intl.DateTimeFormatOptions = {};
        switch (format) {
            case "short":
                options.day = "2-digit";
                options.month = "2-digit";
                options.year = "2-digit";
                break;
            case "long":
                options.day = "numeric";
                options.month = "long";
                options.year = "numeric";
                break;
            case "numeric":
                options.day = "numeric";
                options.month = "numeric";
                options.year = "numeric";
                break;
        }

        return date.toLocaleDateString(locale, options);
    } catch (error) {
        GlobalErrorHandler.logWarning(
            "Error formatting date",
            "formatDate",
            { dateInput, locale, format, error },
        );
        return "";
    }
};

/**
 * Formats just the time part
 * @param dateInput - Date string, Date object, or null/undefined
 * @param locale - Locale string (default: "en-GB")
 * @param format - Format type (default: "short")
 * @returns Formatted time string or empty string if invalid
 */
export const formatTime = (
    dateInput: string | Date | null | undefined,
    locale: string = "en-GB",
    format: "short" | "long" | "numeric" = "short",
): string => {
    if (!dateInput) return "";

    try {
        const date = typeof dateInput === "string"
            ? new Date(dateInput)
            : dateInput;

        if (isNaN(date.getTime())) {
            return "";
        }

        const options: Intl.DateTimeFormatOptions = {};
        switch (format) {
            case "short":
                options.hour = "2-digit";
                options.minute = "2-digit";
                break;
            case "long":
                options.hour = "2-digit";
                options.minute = "2-digit";
                options.second = "2-digit";
                break;
            case "numeric":
                options.hour = "numeric";
                options.minute = "numeric";
                break;
        }

        return date.toLocaleTimeString(locale, options);
    } catch (error) {
        GlobalErrorHandler.logWarning(
            "Error formatting time",
            "formatTime",
            { dateInput, locale, format, error },
        );
        return "";
    }
};

/**
 * Gets relative time string (e.g., "2 hours ago", "in 3 days")
 * @param dateInput - Date string, Date object, or null/undefined
 * @param locale - Locale string (default: "en-GB")
 * @returns Relative time string or empty string if invalid
 */
export const getRelativeTime = (
    dateInput: string | Date | null | undefined,
    locale: string = "en-GB",
): string => {
    if (!dateInput) return "";

    try {
        const date = typeof dateInput === "string"
            ? new Date(dateInput)
            : dateInput;

        if (isNaN(date.getTime())) {
            return "";
        }

        const now = new Date();
        const diffInSeconds = Math.floor(
            (date.getTime() - now.getTime()) / 1000,
        );

        // Use Intl.RelativeTimeFormat if available
        if (typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl) {
            const rtf = new Intl.RelativeTimeFormat(locale, {
                numeric: "auto",
            });

            if (Math.abs(diffInSeconds) < 60) {
                return rtf.format(diffInSeconds, "second");
            } else if (Math.abs(diffInSeconds) < 3600) {
                return rtf.format(Math.floor(diffInSeconds / 60), "minute");
            } else if (Math.abs(diffInSeconds) < 86400) {
                return rtf.format(Math.floor(diffInSeconds / 3600), "hour");
            } else {
                return rtf.format(Math.floor(diffInSeconds / 86400), "day");
            }
        }

        // Fallback for older environments
        const absDiff = Math.abs(diffInSeconds);
        const isFuture = diffInSeconds > 0;

        if (absDiff < 60) {
            return isFuture ? "in a few seconds" : "a few seconds ago";
        } else if (absDiff < 3600) {
            const minutes = Math.floor(absDiff / 60);
            return isFuture
                ? `in ${minutes} minute${minutes > 1 ? "s" : ""}`
                : `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        } else if (absDiff < 86400) {
            const hours = Math.floor(absDiff / 3600);
            return isFuture
                ? `in ${hours} hour${hours > 1 ? "s" : ""}`
                : `${hours} hour${hours > 1 ? "s" : ""} ago`;
        } else {
            const days = Math.floor(absDiff / 86400);
            return isFuture
                ? `in ${days} day${days > 1 ? "s" : ""}`
                : `${days} day${days > 1 ? "s" : ""} ago`;
        }
    } catch (error) {
        GlobalErrorHandler.logWarning(
            "Error getting relative time",
            "getRelativeTime",
            { dateInput, locale, error },
        );
        return "";
    }
};
