import { getIsDev } from "@/shared/hooks/useDev";

/**
 * Global error handler that routes errors to Sentry in production
 * or console in development environment
 */
export class GlobalErrorHandler {
  /**
   * Log an error with context
   * @param error - The error to log
   * @param context - Additional context about where the error occurred
   * @param extra - Extra data to include with the error
   */
  static logError(
    error: Error | string | unknown,
    context?: string,
    extra?: Record<string, any>
  ): void {
    const isDev = getIsDev();
    const errorMessage = this.formatError(error);
    const fullContext = context ? `[${context}] ${errorMessage}` : errorMessage;

    if (isDev) {
      // Development: Log to console with detailed information
      console.group(`🚨 Error${context ? ` in ${context}` : ""}`);
      console.error("Error:", error);
      if (extra && Object.keys(extra).length > 0) {
        console.log("Extra context:", extra);
      }
      if (error instanceof Error && error.stack) {
        console.log("Stack trace:", error.stack);
      }
      console.groupEnd();
    } else {
      // Production: Send to Sentry (to be implemented when Sentry is added)
      this.sendToSentry(error, context, extra);
    }
  }

  /**
   * Log a warning (non-fatal error)
   * @param message - Warning message
   * @param context - Additional context
   * @param extra - Extra data
   */
  static logWarning(
    message: string,
    context?: string,
    extra?: Record<string, any>
  ): void {
    const isDev = getIsDev();
    const fullContext = context ? `[${context}] ${message}` : message;

    if (isDev) {
      console.group(`⚠️  Warning${context ? ` in ${context}` : ""}`);
      console.warn("Warning:", message);
      if (extra && Object.keys(extra).length > 0) {
        console.log("Extra context:", extra);
      }
      console.groupEnd();
    } else {
      // Production: Send warning to Sentry
      this.sendWarningToSentry(message, context, extra);
    }
  }

  /**
   * Log debug information (only in development)
   * @param message - Debug message
   * @param context - Additional context
   * @param data - Data to log
   */
  static logDebug(
    message: string,
    context?: string,
    data?: Record<string, any>
  ): void {
    const isDev = getIsDev();

    if (isDev) {
      console.group(`🔍 Debug${context ? ` in ${context}` : ""}`);
      console.log("Message:", message);
      if (data && Object.keys(data).length > 0) {
        console.log("Data:", data);
      }
      console.groupEnd();
    }
    // No logging in production for debug messages
  }

  /**
   * Format error for consistent logging
   * @param error - The error to format
   * @returns Formatted error message
   */
  private static formatError(error: Error | string | unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "Unknown error occurred";
  }

  /**
   * Send error to Sentry (production)
   * TODO: Implement when Sentry is added to the project
   * @param error - The error to send
   * @param context - Additional context
   * @param extra - Extra data
   */
  private static sendToSentry(
    error: Error | string | unknown,
    context?: string,
    extra?: Record<string, any>
  ): void {
    // TODO: Implement Sentry error reporting
    // Example implementation:
    // try {
    //   Sentry.withScope((scope) => {
    //     if (context) {
    //       scope.setTag("context", context);
    //     }
    //     if (extra) {
    //       scope.setExtras(extra);
    //     }
    //     if (error instanceof Error) {
    //       Sentry.captureException(error);
    //     } else {
    //       Sentry.captureMessage(this.formatError(error), "error");
    //     }
    //   });
    // } catch (sentryError) {
    //   console.error("Failed to send error to Sentry:", sentryError);
    // }

    // Fallback to console in production if Sentry fails
    console.error(`[Production Error]${context ? ` ${context}:` : ""}`, error);
    if (extra) {
      console.error("Extra context:", extra);
    }
  }

  /**
   * Send warning to Sentry (production)
   * TODO: Implement when Sentry is added to the project
   * @param message - Warning message
   * @param context - Additional context
   * @param extra - Extra data
   */
  private static sendWarningToSentry(
    message: string,
    context?: string,
    extra?: Record<string, any>
  ): void {
    // TODO: Implement Sentry warning reporting
    // Example implementation:
    // try {
    //   Sentry.withScope((scope) => {
    //     if (context) {
    //       scope.setTag("context", context);
    //     }
    //     if (extra) {
    //       scope.setExtras(extra);
    //     }
    //     Sentry.captureMessage(message, "warning");
    //   });
    // } catch (sentryError) {
    //   console.error("Failed to send warning to Sentry:", sentryError);
    // }

    // Fallback to console in production if Sentry fails
    console.warn(
      `[Production Warning]${context ? ` ${context}:` : ""}`,
      message
    );
    if (extra) {
      console.warn("Extra context:", extra);
    }
  }
}

/**
 * Hook version of the error handler for use in React components
 */
export const useErrorHandler = () => {
  return {
    logError: GlobalErrorHandler.logError,
    logWarning: GlobalErrorHandler.logWarning,
    logDebug: GlobalErrorHandler.logDebug,
  };
};
