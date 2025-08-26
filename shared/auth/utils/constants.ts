export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 10,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: true,
} as const;

// TODO: Add validation messages to localization.
export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: "email-required",
  EMAIL_INVALID: "email-invalid",
  PASSWORD_REQUIRED: "password-required",
  PASSWORD_TOO_SHORT: "password-too-short",
  PASSWORD_WEAK: "password-weak",
  PASSWORDS_DONT_MATCH: "passwords-dont-match",
  NAME_REQUIRED: "name-required",
  TERMS_REQUIRED: "terms-required",
} as const;
