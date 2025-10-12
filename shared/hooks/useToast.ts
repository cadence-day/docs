import { ToastService } from "@/shared/context/ToastProvider";
import { ToastType } from "@/shared/types/toast.types";
import { useCallback, useState } from "react";

interface ToastState {
  isVisible: boolean;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, "success");
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, "error");
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast(message, "warning");
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, "info");
    },
    [showToast],
  );

  const showConfirm = useCallback(
    async (
      messageOrTitle: string,
      body?: string,
      confirmText: string = "Confirm",
      cancelText: string = "Cancel",
    ) => {
      // Delegate to the provider-level confirm that returns a Promise<boolean>
      try {
        const result = await ToastService.showConfirm(
          messageOrTitle,
          body,
          confirmText,
          cancelText,
        );
        return result;
      } catch {
        return false;
      }
    },
    [],
  );

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
  };
};
