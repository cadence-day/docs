import Toast from "@/shared/components/Toast";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type ToastComponentProps = React.ComponentProps<typeof Toast>;

interface ToastOptions {
  message: string;
  type?: ToastComponentProps["type"];
  duration?: number;
}

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
  const [toast, setToast] = useState<ToastComponentProps | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    ({ message, type = "info", duration = 4000 }: ToastOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({
        message,
        type,
        isVisible: true,
        onHide: () => setToast(null),
      } as ToastComponentProps);

      timeoutRef.current = setTimeout(() => {
        setToast(null);
      }, duration);
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
