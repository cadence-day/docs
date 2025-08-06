// Simplified authentication types

// Re-export error handling types
export type { AuthError, AuthErrorType } from "./errorHandler";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  modalRoute: string | null;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  agreeToTerms: boolean;
}

export interface ResetPasswordForm {
  email: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export type AuthModal =
  | "login"
  | "signup"
  | "reset-password"
  | "delete-user"
  | "email-confirmation"
  | null;

export interface DeepLinkParams {
  type?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  expires_in?: string;
  token_type?: string;
  code?: string;
  error?: string;
  error_description?: string;
  [key: string]: any;
}

export interface AuthHookReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  profileCompletionChecked: boolean;
  shouldShowOnboarding: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (data: SignupForm) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  deleteAccount: () => Promise<void>;
  signInWithApple: () => Promise<AuthResponse>;
  showModal: (route: AuthModal) => void;
  hideModal: () => void;
  markOnboardingComplete: () => void;
}
