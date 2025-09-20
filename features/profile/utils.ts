/**
 * Time validation and formatting utilities for the profile feature
 */

/**
 * Validates if a time string is in the correct HH:MM format
 * @param timeString - The time string to validate
 * @returns true if valid, false otherwise
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  if (!timeString) return false;

  // Check if it matches HH:MM pattern
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeString);
};

/**
 * Formats a time string to ensure it's in HH:MM format
 * Handles various input formats like:
 * - "7:30" -> "07:30"
 * - "730" -> "07:30"
 * - "7" -> "07:00"
 * - "23:5" -> "23:05"
 * @param input - The raw input string
 * @returns formatted time string or null if invalid
 */
export const formatTimeInput = (input: string): string | null => {
  if (!input) return null;

  // Remove any non-digit characters except colon
  const cleaned = input.replace(/[^\d:]/g, "");

  // Handle different input patterns
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":");
    if (parts.length !== 2) return null;

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(minutes)) return null;
    if (hours < 0 || hours > 23) return null;
    if (minutes < 0 || minutes > 59) return null;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } else {
    // Handle input without colon (e.g., "730" or "7")
    if (cleaned.length === 1 || cleaned.length === 2) {
      // Single or double digit hour (e.g., "7" -> "07:00")
      const hours = parseInt(cleaned, 10);
      if (isNaN(hours) || hours < 0 || hours > 23) return null;
      return `${hours.toString().padStart(2, "0")}:00`;
    } else if (cleaned.length === 3 || cleaned.length === 4) {
      // Three or four digits (e.g., "730" -> "07:30", "1430" -> "14:30")
      const hours = parseInt(cleaned.slice(0, -2), 10);
      const minutes = parseInt(cleaned.slice(-2), 10);

      if (isNaN(hours) || isNaN(minutes)) return null;
      if (hours < 0 || hours > 23) return null;
      if (minutes < 0 || minutes > 59) return null;

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
  }

  return null;
};

/**
 * Formats time input as the user types to provide real-time feedback
 * Automatically inserts ":" after 2 digits, or after 1 digit if there are only 3 digits total
 * @param input - The current input value
 * @returns formatted string for display
 */
export const formatTimeInputLive = (input: string): string => {
  if (!input) return "";

  // Remove any non-digit characters
  const digits = input.replace(/\D/g, "");

  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  if (digits.length === 2) return digits;

  // If we have exactly 3 digits, insert colon after first digit (e.g., "930" -> "9:30")
  if (digits.length === 3) {
    return `${digits[0]}:${digits.slice(1)}`;
  }

  // For 4 or more digits, insert colon after first two digits (e.g., "1430" -> "14:30")
  if (digits.length >= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }

  return digits;
};

/**
 * Validates if a time is reasonable for wake up time (typically 4:00-12:00)
 * @param timeString - The time string to validate
 * @returns true if reasonable, false otherwise
 */
export const isReasonableWakeTime = (timeString: string): boolean => {
  if (!isValidTimeFormat(timeString)) return false;

  const [hours] = timeString.split(":").map(Number);
  // Allow wake times between 4:00 AM and 12:00 PM
  return hours >= 4 && hours <= 12;
};

/**
 * Validates if a time is reasonable for sleep time (typically 20:00-2:00)
 * @param timeString - The time string to validate
 * @returns true if reasonable, false otherwise
 */
export const isReasonableSleepTime = (timeString: string): boolean => {
  if (!isValidTimeFormat(timeString)) return false;

  const [hours] = timeString.split(":").map(Number);
  // Allow sleep times between 8:00 PM and 2:00 AM
  return hours >= 20 || hours <= 2;
};

/**
 * Gets a user-friendly error message for invalid time input
 * @param input - The invalid input
 * @param type - Whether it's for wake or sleep time
 * @param t - Translation function
 * @returns error message string
 */
export const getTimeValidationError = (
  input: string,
  type: "wake" | "sleep",
  t: (key: string) => string
): string => {
  if (!input) return t("profile.error-messages.time-required");

  const formatted = formatTimeInput(input);
  if (!formatted) return t("profile.error-messages.time-format");

  if (type === "wake" && !isReasonableWakeTime(formatted)) {
    return t("profile.error-messages.wake-time-range");
  }

  if (type === "sleep" && !isReasonableSleepTime(formatted)) {
    return t("profile.error-messages.sleep-time-range");
  }

  return "";
};
