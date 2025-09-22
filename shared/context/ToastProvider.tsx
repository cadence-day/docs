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
  title: string;
  body: string;
  type: ToastType;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
  dismissible?: boolean;
  href?: string;
  onPress?: () => void;
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
  showError: (
    title: string,
    body: string,
    duration?: number,
    href?: string
  ) => {
    toastService.showToast({ title, body, type: "error", duration, href });
  },
  showSuccess: (
    title: string,
    body: string,
    duration?: number,
    href?: string
  ) => {
    toastService.showToast({ title, body, type: "success", duration, href });
  },
  showWarning: (
    title: string,
    body: string,
    duration?: number,
    href?: string
  ) => {
    toastService.showToast({ title, body, type: "warning", duration, href });
  },
  showInfo: (title: string, body: string, duration?: number, href?: string) => {
    toastService.showToast({ title, body, type: "info", duration, href });
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastComponentState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    ({
      title,
      body,
      type = "info",
      duration = 4000,
      dismissible = true,
      href,
      onPress,
    }: ToastOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({
        title,
        body,
        type,
        isVisible: true,
        onHide: () => setToast(null),
        duration,
        dismissible,
        href,
        onPress,
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
