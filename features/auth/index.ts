// Main authentication exports - simplified structure

// Core hook and provider
export { AuthProvider, useAuth } from "./components/AuthProvider";

// Store hook
export { useAuthStore } from "./hooks/useAuthStore";

// Components
export { default as AuthModalRouter } from "./components/AuthModalRouter";
export { AppleSignInButton, Auth } from "./components";

// Services
export { signInWithApple } from "./services/auth-api";

// Error handling
export {
  classifyAuthError,
  handleAuthResponse,
  processAuthError,
  useAuthErrorHandler,
} from "./utils/errorHandler";

// Types
export type {
  AuthError,
  AuthErrorType,
  AuthModal,
  AuthUser,
  LoginForm,
  ResetPasswordForm,
  SignupForm,
} from "./utils/types";

// Validation utilities
export {
  calculatePasswordStrength,
  validateLoginForm,
  validateResetPasswordForm,
  validateSignupForm,
} from "./utils/validation";
