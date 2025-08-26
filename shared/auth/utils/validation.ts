// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Name validation - updated to require both first and last name for Clerk
export const validateName = (name: string): string | null => {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) return "Name is required";
  if (trimmedName.length < 2) return "Name must be at least 2 characters";

  const nameParts = trimmedName.split(" ");
  if (nameParts.length < 2 || nameParts[1].trim().length === 0) {
    return "Please enter both first and last name";
  }

  return null;
};

// Email field validation with error message
export const validateEmailField = (email: string): string | null => {
  if (email.length === 0) return "Email is required";
  if (!isValidEmail(email)) return "Please enter a valid email address";
  return null;
};

// Password field validation with detailed error messages
export const validatePasswordField = (password: string): string | null => {
  if (password.length === 0) return "Password is required";
  if (password.length < 10) return "Password must be at least 10 characters";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one digit";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password))
    return "Password must contain at least one special character";
  return null;
};

// Repeat password validation
export const validateRepeatPasswordField = (
  repeatPassword: string,
  password: string
): string | null => {
  if (repeatPassword.length === 0) return "Please confirm your password";
  if (repeatPassword !== password) return "Passwords do not match";
  return null;
};

export interface PasswordValidationResult {
  isValid: boolean;
  error: string | null;
}

export const validatePassword = (
  password: string,
  repeatPassword: string,
  agreeToTerms: boolean
): PasswordValidationResult => {
  // Check if passwords match
  if (password !== repeatPassword) {
    return {
      isValid: false,
      error: "Passwords do not match",
    };
  }

  // Check password length
  if (password.length < 10) {
    return {
      isValid: false,
      error: "Password must be at least 10 characters",
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  // Check for digit
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one digit",
    };
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character",
    };
  }

  // Check terms agreement
  if (!agreeToTerms) {
    return {
      isValid: false,
      error: "You must agree to the terms and conditions",
    };
  }

  // All validations passed
  return {
    isValid: true,
    error: null,
  };
};
