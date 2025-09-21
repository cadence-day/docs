import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";
import { GlobalErrorHandler } from "../../../shared/utils/errorHandler";
import type { LoadingState } from "../types";

interface UseErrorHandlingReturn {
  error: string | null;
  loadingState: LoadingState;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoadingState: (state: LoadingState) => void;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorPrefix?: string;
      showHapticFeedback?: boolean;
    },
  ) => Promise<T | null>;
}

export const useErrorHandling = (): UseErrorHandlingReturn => {
  const [error, setError] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: {
        successMessage?: string;
        errorPrefix?: string;
        showHapticFeedback?: boolean;
      } = {},
    ): Promise<T | null> => {
      const {
        successMessage,
        errorPrefix = "Operation failed",
        showHapticFeedback = true,
      } = options;

      try {
        setLoadingState("loading");
        clearError();

        const result = await operation();

        setLoadingState("success");

        if (showHapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        if (successMessage) {
          // Could integrate with toast/notification system here
          GlobalErrorHandler.logDebug("Success", "SUCCESS_NOTIFICATION", {
            message: successMessage,
          });
        }

        return result;
      } catch (err: any) {
        setLoadingState("error");
        const errorMessage = `${errorPrefix}: ${
          err?.message || "Unknown error"
        }`;
        setError(errorMessage);

        if (showHapticFeedback) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        GlobalErrorHandler.logError(errorMessage, "ASYNC_OPERATION_ERROR", {
          error: err,
        });
        return null;
      }
    },
    [clearError],
  );

  return {
    error,
    loadingState,
    setError,
    clearError,
    setLoadingState,
    handleAsyncOperation,
  };
};
