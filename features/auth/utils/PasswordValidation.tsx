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
      error: "Passwords do not match"
    };
  }

  // Check password length
  if (password.length < 10) {
    return {
      isValid: false,
      error: "Password must be at least 10 characters"
    };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter"
    };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter"
    };
  }

  // Check for digit
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one digit"
    };
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one special character"
    };
  }

  // Check terms agreement
  if (!agreeToTerms) {
    return {
      isValid: false,
      error: "You must agree to the terms and conditions"
    };
  }

  // All validations passed
  return {
    isValid: true,
    error: null
  };
};
