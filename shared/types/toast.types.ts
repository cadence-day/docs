export type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "notification"; // 'notification' is a neutral type without specific icon/color

export interface ToastOptions {
  title: string; // Required title (header)
  body: string; // Required body text
  type?: ToastType;
  duration?: number;
  dismissible?: boolean;
  // Navigation options
  href?: string; // Expo Router path to navigate to on tap
  onPress?: () => void; // Custom action on tap (alternative to href)
}
