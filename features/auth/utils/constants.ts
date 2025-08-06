// Auth constants

export const AUTH_ROUTES = {
  LOGIN: "login",
  SIGNUP: "signup",
  RESET_PASSWORD: "reset-password",
  MAGIC_LINK: "magic-link",
  OTP: "otp",
  DELETE_USER: "delete-user",
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 10,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Please enter a valid email address",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
  PASSWORD_WEAK: "Password is too weak",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  NAME_REQUIRED: "Full name is required",
  TERMS_REQUIRED: "You must agree to the terms of service",
} as const;

export const DEEP_LINK_TYPES = {
  RECOVERY: "recovery",
  MAGIC_LINK: "magiclink",
  SIGNUP: "signup",
  INVITE: "invite",
  EMAIL_CONFIRMATION: "email_confirmation",
} as const;
