import { Alert } from "react-native";
import { useI18n } from "@/shared/hooks/useI18n";

// Auth error types for better error categorization
export type AuthErrorType =
  | "invalid_credentials"
  | "email_not_confirmed"
  | "too_many_attempts"
  | "network_error"
  | "bad_request"
  | "unauthorized"
  | "rate_limit"
  | "validation_error"
  | "unexpected_error"
  | "apple_not_configured"
  | "apple_canceled"
  | "apple_unavailable"
  | "unknown";

// Standardized auth error interface
export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: any;
  statusCode?: number;
  errorCode?: string;
}

// Error classification patterns
const ERROR_PATTERNS = {
  invalid_credentials: [
    "invalid login credentials",
    "invalid email or password",
    "email or password is incorrect",
  ],
  email_not_confirmed: [
    "email not confirmed",
    "email_not_confirmed",
    "signup_not_confirmed",
  ],
  too_many_attempts: [
    "too many requests",
    "rate limit exceeded",
    "too many login attempts",
  ],
  network_error: [
    "network request failed",
    "fetch error",
    "connection failed",
    "network error",
  ],
  apple_not_configured: [
    'provider (issuer "https://appleid.apple.com") is not enabled',
    "apple sign in is not configured",
    "provider not enabled",
  ],
  apple_canceled: [
    "apple sign in was canceled",
    "err_request_canceled",
    "err_canceled",
    "canceled",
  ],
  apple_unavailable: [
    "apple sign in is not available",
    "apple authentication is not available",
    "not available on this device",
  ],
  timeout: ["timeout", "request timeout", "operation timeout"],
};

// Status code mappings
const STATUS_CODE_MAPPINGS: Record<number, AuthErrorType> = {
  400: "bad_request",
  401: "unauthorized",
  403: "unauthorized",
  429: "too_many_attempts",
  500: "network_error",
  502: "network_error",
  503: "network_error",
  504: "network_error",
};

/**
 * Classifies an error based on message content and status codes
 */
export function classifyAuthError(error: any): AuthErrorType {
  if (!error) return "unknown";

  const errorMessage = (
    error.message ||
    error.error_description ||
    ""
  ).toLowerCase();
  const errorCode = error.code || "";
  const statusCode = error.status || error.statusCode;

  // Check status codes first
  if (statusCode && STATUS_CODE_MAPPINGS[statusCode]) {
    return STATUS_CODE_MAPPINGS[statusCode];
  }

  // Check specific error codes
  if (errorCode === "too_many_requests" || statusCode === 429) {
    return "too_many_attempts";
  }

  // Check message patterns
  for (const [errorType, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some((pattern) => errorMessage.includes(pattern))) {
      return errorType as AuthErrorType;
    }
  }

  // Network-related errors (server errors)
  if (statusCode >= 500) {
    return "network_error";
  }

  return "unknown";
}

/**
 * Gets a user-friendly error message based on error type and i18n
 */
export function getErrorMessage(
  errorType: AuthErrorType,
  t: any,
  originalMessage?: string
): string {
  const errorMessages: Record<AuthErrorType, string> = {
    invalid_credentials:
      t("auth.errors.invalidCredentials") || "Invalid email or password",
    email_not_confirmed:
      t("auth.errors.emailNotConfirmed") ||
      "Please check your email and confirm your account",
    too_many_attempts:
      t("auth.errors.tooManyAttempts") ||
      "Too many attempts. Please wait before trying again",
    network_error:
      t("auth.errors.networkError") ||
      "Network error. Please check your connection",
    bad_request:
      t("auth.errors.badRequest") || "Invalid request. Please check your input",
    unauthorized: t("auth.errors.unauthorized") || "Invalid email or password",
    rate_limit:
      t("auth.errors.rateLimit") ||
      "Too many requests. Please wait before trying again",
    validation_error:
      t("auth.errors.validationError") ||
      "Please check your input and try again",
    unexpected_error:
      t("auth.errors.unexpectedError") || "An unexpected error occurred",
    apple_not_configured:
      t("auth.errors.appleNotConfigured") ||
      "Apple Sign In is not configured. Please use email/password or contact support.",
    apple_canceled:
      t("auth.errors.appleCanceled") || "Apple Sign In was canceled",
    apple_unavailable:
      t("auth.errors.appleUnavailable") ||
      "Apple Sign In is not available on this device",
    unknown:
      originalMessage ||
      t("auth.errors.unknown") ||
      "An error occurred. Please try again",
  };

  return errorMessages[errorType];
}

/**
 * Main auth error handler - processes errors and returns structured error info
 */
export function processAuthError(error: any, context?: string): AuthError {
  const errorType = classifyAuthError(error);
  const statusCode = error?.status || error?.statusCode;
  const errorCode = error?.code;

  // For unknown errors, try to preserve the original message if it's meaningful
  const preserveOriginalMessage =
    errorType === "unknown" &&
    error?.message &&
    !error.message.includes("undefined") &&
    error.message.length > 5;

  return {
    type: errorType,
    message: preserveOriginalMessage ? error.message : "",
    originalError: error,
    statusCode,
    errorCode,
  };
}

/**
 * Hook for handling auth errors with consistent logging and user feedback
 */
export function useAuthErrorHandler() {
  const { t } = useI18n();

  const handleAuthError = (
    error: any,
    context: string,
    metadata?: Record<string, any>
  ): AuthError => {
    const processedError = processAuthError(error, context);
    const userMessage = getErrorMessage(
      processedError.type,
      t,
      processedError.message
    );

    // Log error details for debugging
    console.error(`Auth Error [${context}]:`, {
      type: processedError.type,
      message: error?.message,
      statusCode: processedError.statusCode,
      errorCode: processedError.errorCode,
      originalError: error,
      metadata,
    });

    return {
      ...processedError,
      message: userMessage,
    };
  };

  const showAuthError = (
    error: any,
    context: string,
    title?: string,
    metadata?: Record<string, any>
  ): AuthError => {
    const processedError = handleAuthError(error, context, metadata);

    // Show alert to user
    Alert.alert(title || "Authentication Error", processedError.message);

    return processedError;
  };

  return {
    handleAuthError,
    showAuthError,
    processAuthError,
    classifyAuthError,
    getErrorMessage: (errorType: AuthErrorType, originalMessage?: string) =>
      getErrorMessage(errorType, t, originalMessage),
  };
}

/**
 * Utility function for handling auth API responses
 */
export function handleAuthResponse<T>(
  result: { success: boolean; error?: string; data?: T },
  context: string,
  onSuccess?: (data: T) => void,
  onError?: (error: AuthError) => void
): boolean {
  if (result.success && result.data) {
    onSuccess?.(result.data);
    return true;
  } else if (result.error) {
    const processedError = processAuthError({ message: result.error }, context);
    onError?.(processedError);
    return false;
  }

  return false;
}
