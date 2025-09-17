// Centralized error handler for API functions
import { ToastService } from "@/shared/context/ToastProvider";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number; // Base delay in ms
  maxDelay?: number; // Max delay in ms
  retryableErrors?: string[]; // Error codes/messages that should trigger retry
}

export class ApiError extends Error {
  constructor(
    public context: string,
    public originalError: any,
    public isRetryable: boolean = false
  ) {
    super(`[${context}] ${getErrorMessage(originalError)}`);
    this.name = "ApiError";
  }
}

/**
 * Map a technical error to a friendly, user-facing message.
 * Keep messages short and actionable; loggers still receive full details.
 */
function getUserFriendlyMessage(error: any): string {
  const message = getErrorMessage(error).toLowerCase();

  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("connection")
  ) {
    return "We couldn't reach our servers. Please check your internet connection and try again.";
  }

  if (
    message.includes("401") ||
    message.includes("unauthori") ||
    message.includes("token")
  ) {
    return "You need to sign in again. Please log in to continue.";
  }

  if (message.includes("403") || message.includes("forbid")) {
    return "You don't have permission to do that.";
  }

  if (message.includes("rate limit") || message.includes("429")) {
    return "You're doing that a bit too quickly. Please wait a moment and try again.";
  }

  if (
    message.includes("encrypt") ||
    message.includes("decrypt") ||
    message.includes("encryption")
  ) {
    return "There was a problem accessing secure data. Try restarting the app or contacting support.";
  }

  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("server")
  ) {
    return "Something went wrong on our end. Please try again later.";
  }

  // Fallback: show a concise, non-technical message
  return "Something went wrong. Please try again.";
}

function getErrorMessage(error: any): string {
  return (
    error?.message ||
    error?.error_description ||
    String(error) ||
    "Unknown error"
  );
}

function isRetryableError(error: any, retryableErrors: string[] = []): boolean {
  const message = getErrorMessage(error).toLowerCase();
  const defaultRetryableErrors = [
    "network error",
    "timeout",
    "connection",
    "temporary",
    "rate limit",
    "429", // Too Many Requests
    "500", // Internal Server Error
    "502", // Bad Gateway
    "503", // Service Unavailable
    "504", // Gateway Timeout
  ];

  const allRetryableErrors = [...defaultRetryableErrors, ...retryableErrors];
  return allRetryableErrors.some((retryableError) =>
    message.includes(retryableError)
  );
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Enhanced error handler with retry logic
 */
export async function handleApiErrorWithRetry<T>(
  context: string,
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryableErrors = [],
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt or if error is not retryable
      if (attempt === maxRetries || !isRetryableError(error, retryableErrors)) {
        break;
      }

      // Exponential backoff with jitter
      const delayMs = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      GlobalErrorHandler.logWarning(
        `Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${delayMs}ms`,
        `API_RETRY_${context}`,
        {
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
          delayMs,
          error: getErrorMessage(error),
        }
      );
      await delay(delayMs);
    }
  }

  const apiError = new ApiError(
    context,
    lastError,
    isRetryableError(lastError, retryableErrors)
  );

  GlobalErrorHandler.logError(apiError, "API_ERROR", {
    context,
    originalError: getErrorMessage(lastError),
    isRetryable: apiError.isRetryable,
    maxRetriesReached: true,
  });

  // Show a friendly message to the user while logging full details for developers
  ToastService.showError(getUserFriendlyMessage(lastError));

  throw apiError;
}

/**
 * Centralized error handler for API functions.
 *
 * Logs the provided error with context information and throws an ApiError.
 * This function never returns; it always throws.
 *
 * @param {string} context - A string describing the context in which the error occurred (e.g., function or operation name).
 * @param {*} error - The original error object to be handled and logged.
 * @throws {ApiError} Always throws a formatted ApiError containing the context and original error.
 * @returns {never} This function never returns.
 */
export function handleApiError(context: string, error: any): never {
  const apiError = new ApiError(context, error);

  GlobalErrorHandler.logError(apiError, "API_ERROR", {
    context,
    originalError: getErrorMessage(error),
    errorType: error?.constructor?.name || "Unknown",
  });

  // Show a concise, user-friendly message instead of the raw technical message
  ToastService.showError(getUserFriendlyMessage(error));

  throw apiError;
}
