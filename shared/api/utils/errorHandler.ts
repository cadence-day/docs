// Centralized error handler for API functions
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

  throw apiError;
}
