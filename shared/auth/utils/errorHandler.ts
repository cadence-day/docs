export interface ClerkErrorMapping {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  general: string | null;
}

export interface ParsedClerkError {
  fieldErrors: ClerkErrorMapping;
  hasErrors: boolean;
  generalError: string | null;
  toastMessage: string | null;
}

/**
 * Parses Clerk errors and returns structured error information
 * @param error - The error object from Clerk
 * @returns Parsed error information with field mappings and toast message
 */
export const parseClerkErrors = (error: any): ParsedClerkError => {
  const fieldErrors: ClerkErrorMapping = {
    email: null,
    firstName: null,
    lastName: null,
    password: null,
    general: null,
  };

  let toastMessage: string | null = null;
  let generalError: string | null = null;

  // Handle null, undefined, or empty errors
  if (!error) {
    const fallbackMessage = "An unexpected error occurred. Please try again.";
    fieldErrors.general = fallbackMessage;
    generalError = fallbackMessage;
    toastMessage = fallbackMessage;

    return {
      fieldErrors,
      hasErrors: true,
      generalError,
      toastMessage,
    };
  }

  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    // Collect all error messages for toast
    const errorMessages: string[] = [];

    error.errors.forEach((err: any) => {
      const paramName = err.meta?.paramName;
      const message = err.message || err.longMessage;

      if (message) {
        errorMessages.push(message);
      }

      // Map errors to specific fields
      switch (paramName) {
        case "email_address":
          fieldErrors.email = message;
          break;
        case "first_name":
          fieldErrors.firstName = message;
          break;
        case "last_name":
          fieldErrors.lastName = message;
          break;
        case "password":
          fieldErrors.password = message;
          break;
        default:
          if (!fieldErrors.general) {
            fieldErrors.general = message;
            generalError = message;
          }
          break;
      }
    });

    // Create toast message from first error or most relevant error
    if (errorMessages.length > 0) {
      toastMessage = errorMessages[0];
    }
  } else {
    // Fallback for unexpected error format
    const fallbackMessage =
      error?.message ||
      error?.toString() ||
      "An unexpected error occurred. Please try again.";
    fieldErrors.general = fallbackMessage;
    generalError = fallbackMessage;
    toastMessage = fallbackMessage;
  }

  const hasErrors = Object.values(fieldErrors).some((error) => error !== null);

  return {
    fieldErrors,
    hasErrors,
    generalError,
    toastMessage,
  };
};

/**
 * Creates a function to clear specific Clerk errors
 * @param setClerkErrors - State setter for clerk errors
 * @returns Function to clear specific fields
 */
export const createClerkErrorClearer = (
  setClerkErrors: React.Dispatch<React.SetStateAction<ClerkErrorMapping>>
) => {
  return (field: keyof ClerkErrorMapping) => {
    setClerkErrors((prev) => ({ ...prev, [field]: null }));
  };
};

/**
 * Clears all Clerk errors
 * @param setClerkErrors - State setter for clerk errors
 */
export const clearAllClerkErrors = (
  setClerkErrors: React.Dispatch<React.SetStateAction<ClerkErrorMapping>>
) => {
  setClerkErrors({
    email: null,
    firstName: null,
    lastName: null,
    password: null,
    general: null,
  });
};

/**
 * Common Clerk error codes and their user-friendly messages
 */
export const CLERK_ERROR_MESSAGES = {
  form_identifier_exists:
    "That email address is already taken. Please try another.",
  form_param_nil: "This field is required.",
  form_password_pwned:
    "This password has been found in a data breach. Please choose a different password.",
  form_password_too_common:
    "This password is too common. Please choose a more secure password.",
  form_invalid_email_address: "Please enter a valid email address.",
  form_password_length_too_short:
    "Password must be at least 8 characters long.",
  session_exists: "You are already signed in.",
  identifier_already_signed_in: "You are already signed in with this account.",
} as const;

/**
 * Gets user-friendly error message from Clerk error code
 * @param code - Clerk error code
 * @param fallback - Fallback message if code not found
 * @returns User-friendly error message
 */
export const getClerkErrorMessage = (
  code: string,
  fallback: string
): string => {
  return (
    CLERK_ERROR_MESSAGES[code as keyof typeof CLERK_ERROR_MESSAGES] || fallback
  );
};
