import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

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

    GlobalErrorHandler.logError(
      new Error(fallbackMessage),
      "AUTH_CLERK_EMPTY_ERROR",
      { errorType: "empty_error" }
    );

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
    const errorDetails: any[] = [];

    error.errors.forEach((err: any) => {
      const paramName = err.meta?.paramName;
      const message = err.message || err.longMessage;
      const code = err.code;

      if (message) {
        errorMessages.push(message);
      }

      errorDetails.push({
        paramName,
        message,
        code,
        meta: err.meta,
      });

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

    // Log the Clerk errors using global error handler
    GlobalErrorHandler.logError(error, "AUTH_CLERK_VALIDATION", {
      errorCount: error.errors.length,
      errorDetails,
      fieldErrorsGenerated: fieldErrors,
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

    GlobalErrorHandler.logError(error, "AUTH_CLERK_UNEXPECTED_FORMAT", {
      errorType: "unexpected_format",
      originalError: error,
      fallbackMessage,
    });
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

    GlobalErrorHandler.logDebug(
      `Cleared Clerk error for field: ${field}`,
      "AUTH_CLERK_ERROR_CLEAR"
    );
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

  GlobalErrorHandler.logDebug(
    "Cleared all Clerk errors",
    "AUTH_CLERK_ERROR_CLEAR_ALL"
  );
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
  const friendlyMessage =
    CLERK_ERROR_MESSAGES[code as keyof typeof CLERK_ERROR_MESSAGES] || fallback;

  if (friendlyMessage !== fallback) {
    GlobalErrorHandler.logDebug(
      `Mapped Clerk error code '${code}' to friendly message`,
      "AUTH_CLERK_ERROR_MAPPING",
      { code, friendlyMessage }
    );
  }

  return friendlyMessage;
};

/**
 * Handles authentication-related errors with proper logging
 * @param error - The authentication error
 * @param context - Additional context about the auth operation
 * @param extra - Extra data to include with the error
 */
export const handleAuthError = (
  error: any,
  context: string,
  extra?: Record<string, any>
) => {
  GlobalErrorHandler.logError(error, `AUTH_${context}`, {
    authContext: context,
    errorType: error?.constructor?.name || typeof error,
    ...extra,
  });
};

/**
 * Handles authentication warnings
 * @param message - Warning message
 * @param context - Additional context
 * @param extra - Extra data
 */
export const handleAuthWarning = (
  message: string,
  context: string,
  extra?: Record<string, any>
) => {
  GlobalErrorHandler.logWarning(message, `AUTH_${context}`, {
    authContext: context,
    ...extra,
  });
};
