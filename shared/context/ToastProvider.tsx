import Toast from "@/shared/components/Toast";
import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
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
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  // Optional confirm API exposed by the provider
  showConfirm?: (opts: {
    title: string;
    body?: string;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
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
  // Promise-based confirm dialog. Returns a Promise that resolves to true when confirmed, false otherwise.
  showConfirm: async (
    title: string,
    body?: string,
    confirmText: string = "Confirm",
    cancelText: string = "Cancel"
  ): Promise<boolean> => {
    // toastService may be replaced by provider at runtime; guard it
    if (typeof toastService.showConfirm === "function") {
      return toastService.showConfirm({ title, body, confirmText, cancelText });
    }
    // If provider not initialized, fallback to resolved false
    return Promise.resolve(false);
  },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastComponentState | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    body?: string;
    isVisible: boolean;
    confirmText?: string;
    cancelText?: string;
    resolve: (value: boolean) => void;
  } | null>(null);
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

  const showConfirm = useCallback(
    ({
      title,
      body,
      confirmText = "Confirm",
      cancelText = "Cancel",
    }: {
      title: string;
      body?: string;
      confirmText?: string;
      cancelText?: string;
    }) => {
      return new Promise<boolean>((resolve) => {
        setConfirm({
          title,
          body,
          isVisible: true,
          confirmText,
          cancelText,
          resolve,
        });
      });
    },
    []
  );

  // expose showConfirm on the runtime service object
  toastService = { showToast, showConfirm } as ToastContextType;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast {...toast} />}

      {confirm && (
        <Modal transparent visible={confirm.isVisible} animationType="fade">
          <View style={confirmStyles.overlay}>
            <View style={confirmStyles.container}>
              <Text style={confirmStyles.title}>{confirm.title}</Text>
              {confirm.body ? (
                <Text style={confirmStyles.body}>{confirm.body}</Text>
              ) : null}
              <View style={confirmStyles.actions}>
                <TouchableOpacity
                  style={confirmStyles.cancelButton}
                  onPress={() => {
                    confirm.resolve(false);
                    setConfirm(null);
                  }}
                >
                  <Text style={confirmStyles.cancelText}>
                    {confirm.cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={confirmStyles.confirmButton}
                  onPress={() => {
                    confirm.resolve(true);
                    setConfirm(null);
                  }}
                >
                  <Text style={confirmStyles.confirmText}>
                    {confirm.confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ToastContext.Provider>
  );
};

const confirmStyles = StyleSheet.create({
  overlay: {
    ...CONTAINER.layout.flex.grow,
    backgroundColor: COLORS.dark.background.overlay,
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.padding["2xl"],
  },
  container: {
    backgroundColor: COLORS.neutral.white,
    ...CONTAINER.border.radius.md,
    ...CONTAINER.padding.xl,
    ...CONTAINER.size.width.full,
    maxWidth: 520,
  },
  title: {
    ...TYPOGRAPHY.heading.h2,
    ...CONTAINER.margin.bottom.base,
  },
  body: {
    ...TYPOGRAPHY.body.medium,
    color: COLORS.light.text.secondary,
    ...CONTAINER.margin.bottom.lg,
  },
  actions: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.justify.end,
  },
  cancelButton: {
    ...CONTAINER.padding.vertical.md,
    ...CONTAINER.padding.horizontal.md,
    ...CONTAINER.margin.right.base,
  },
  cancelText: {
    color: COLORS.light.text.secondary,
    ...TYPOGRAPHY.body.medium,
  },
  confirmButton: {
    backgroundColor: COLORS.brand.primary,
    ...CONTAINER.padding.vertical.md,
    ...CONTAINER.padding.horizontal.md,
    ...CONTAINER.border.radius.sm,
  },
  confirmText: {
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.button.small,
  },
});
