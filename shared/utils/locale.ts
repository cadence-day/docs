/**
 * Normalizes locale strings from database format (en_US) to BCP 47 format (en-US)
 * This is needed because the database stores locales with underscores, but JavaScript's
 * Intl API expects BCP 47 language tags with hyphens.
 *
 * @param locale - The locale string to normalize (e.g., "en_US")
 * @returns The normalized locale string (e.g., "en-US")
 */
export const normalizeLocale = (locale: string | null | undefined): string => {
  if (!locale) {
    return "en-US"; // Default fallback
  }

  // Replace underscores with hyphens to convert to BCP 47 format
  return locale.replace(/_/g, "-");
};

/**
 * Validates if a locale string is a valid BCP 47 language tag
 * @param locale - The locale string to validate
 * @returns true if the locale is valid, false otherwise
 */
export const isValidLocale = (locale: string): boolean => {
  try {
    // Try to create an Intl.DateTimeFormat with the locale
    // This will throw an error if the locale is invalid
    new Intl.DateTimeFormat(locale);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets a safe locale string that's guaranteed to work with Intl APIs
 * @param locale - The locale string to make safe
 * @returns A valid locale string
 */
export const getSafeLocale = (locale: string | null | undefined): string => {
  const normalized = normalizeLocale(locale);
  return isValidLocale(normalized) ? normalized : "en-US";
};
