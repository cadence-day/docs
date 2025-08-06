import * as React from "react";
import {
  ValidationResult,
  PasswordStrength,
  LoginForm,
  SignupForm,
  ResetPasswordForm,
} from "./types";
import { PASSWORD_REQUIREMENTS, VALIDATION_MESSAGES } from "./constants";

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength calculation
export const calculatePasswordStrength = (
  password: string
): PasswordStrength => {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  const strengthMap = {
    0: { label: "Very Weak", color: "#ff4444" },
    1: { label: "Weak", color: "#ff8800" },
    2: { label: "Fair", color: "#ffcc00" },
    3: { label: "Good", color: "#88cc00" },
    4: { label: "Strong", color: "#44cc44" },
    5: { label: "Very Strong", color: "#00cc44" },
  };

  return {
    score,
    label: strengthMap[score as keyof typeof strengthMap].label,
    color: strengthMap[score as keyof typeof strengthMap].color,
    requirements,
  };
};

// Login form validation
export const validateLoginForm = (form: LoginForm): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.email) {
    errors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
  } else if (!isValidEmail(form.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  if (!form.password) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Signup form validation
export const validateSignupForm = (form: SignupForm): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.email) {
    errors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
  } else if (!isValidEmail(form.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  if (!form.password) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  } else if (form.password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.password = VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
  } else {
    const strength = calculatePasswordStrength(form.password);
    if (strength.score < 3) {
      errors.password = VALIDATION_MESSAGES.PASSWORD_WEAK;
    }
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = VALIDATION_MESSAGES.PASSWORDS_DONT_MATCH;
  }

  if (!form.fullName.trim()) {
    errors.fullName = VALIDATION_MESSAGES.NAME_REQUIRED;
  }

  if (!form.agreeToTerms) {
    errors.agreeToTerms = VALIDATION_MESSAGES.TERMS_REQUIRED;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Reset password form validation
export const validateResetPasswordForm = (
  form: ResetPasswordForm
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!form.email) {
    errors.email = VALIDATION_MESSAGES.EMAIL_REQUIRED;
  } else if (!isValidEmail(form.email)) {
    errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Hook for form validation
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validator: (values: T) => ValidationResult
) => {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (name: keyof T, value: any) => {
    const newValues = { ...values, [name]: value };
    const result = validator(newValues);
    setErrors(result.errors);
    return result.isValid;
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name as string]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validate = () => {
    const result = validator(values);
    setErrors(result.errors);
    setTouched(
      Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return result.isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};
