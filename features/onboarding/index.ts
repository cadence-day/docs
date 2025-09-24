// Main component
export { OnboardingDialog as default } from "./components/Onboarding";

// Hooks (public API)
export { useOnboardingData } from "./hooks/useOnboardingData";
export { useOnboardingActions } from "./hooks/useOnboardingActions";

// Types (public interfaces only)
export type {
  OnboardingPage,
  OnboardingDialogHandle,
  OnboardingDialogProps,
} from "./types";

// Components (if needed by other features)
export { OnboardingPageIndicators, OnboardingIcon } from "./components/ui";
