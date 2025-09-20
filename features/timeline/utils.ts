import { Timeslice } from "@/shared/types/models";

export const getContrastColor = (backgroundColor: string): string => {
  // Handle null, undefined, or empty string
  if (!backgroundColor) {
    return "#000000";
  }

  // Remove # if present and ensure we have a valid hex color
  let hex = backgroundColor.replace("#", "").trim();

  // Handle 3-character hex codes by expanding them
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Validate hex format
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    // Use the global error handler to report invalid color formats
    // Importing directly would create a cycle; gracefully return default.
    try {
      const { GlobalErrorHandler } = require("@/shared/utils/errorHandler");
      GlobalErrorHandler.logWarning(
        `Invalid color format: ${backgroundColor}. Using default contrast.`,
        "Timeline:getContrastColor",
        { value: backgroundColor }
      );
    } catch {}
    return "#000000";
  }

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance using WCAG 2.0 formula
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

/**
 * Check if a timeslice has notes or states attached to it
 */
export const hasNotesOrStates = (timeslice: Timeslice): boolean => {
  const hasNotes = timeslice.note_ids && timeslice.note_ids.length > 0;
  const hasState = timeslice.state_id !== null;
  return !!(hasNotes || hasState);
};
