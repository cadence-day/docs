import Toast from "@/shared/components/Toast";
import {
  ToastOptions as SharedToastOptions,
  ToastType,
} from "@/shared/types/toast.types";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

// Local toast state shape passed to the Toast component
interface ToastComponentState {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
  dismissible?: boolean;
}

type ToastOptions = SharedToastOptions;

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastService = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastService must be used within a ToastProvider");
  }
  return context;
};

let toastService: ToastContextType;

export const ToastService = {
  show: (options: ToastOptions) => {
    toastService.showToast(options);
  },
  showError: (message: string, duration?: number) => {
    toastService.showToast({ message, type: "error", duration });
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastComponentState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    ({
      message,
      type = "info",
      duration = 4000,
      dismissible = true,
    }: ToastOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({
        message,
        type,
        isVisible: true,
        onHide: () => setToast(null),
        duration,
        dismissible,
      });

      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setToast(null);
        }, duration);
      }
    },
    []
  );

  toastService = { showToast };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}
    </ToastContext.Provider>
  );
};
