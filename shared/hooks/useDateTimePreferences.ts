import { useMemo } from "react";

import {
  DateTimePreferences,
  getDeviceDateTimePreferences,
} from "@/shared/utils/datetime";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

/**
 * Hook to get device datetime preferences (timezone, locale, date format, time format)
 * Uses only device settings, including locale
 * @returns DateTimePreferences object with timezone, locale, date format, and time format
 */
export const useDateTimePreferences = (): DateTimePreferences => {
  return useMemo(() => {
    try {
      // Always use device settings for datetime preferences, including locale
      return getDeviceDateTimePreferences();
    } catch (error) {
      GlobalErrorHandler.logError(error, "useDateTimePreferences", {});
      return getDeviceDateTimePreferences();
    }
  }, []);
};

export default useDateTimePreferences;
