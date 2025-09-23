export interface OnboardingPage {
  title: string;
  content: string;
  icon?: React.ReactNode;
  iconType?: "onboarding" | "sage" | null;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
  linkText?: {
    text: string;
    onPress: () => void;
  };
  footer?: string;
}

export interface OnboardingDialogHandle {
  confirm: () => void;
}

export interface OnboardingDialogProps {
  confirm?: () => void;
  headerProps?: Record<string, unknown>;
  _dialogId?: string;
}

