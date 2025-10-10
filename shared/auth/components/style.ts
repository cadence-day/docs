import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Common styles
  container: {
    ...CONTAINER.layout.flex.grow,
    ...CONTAINER.size.width.full,
    ...CONTAINER.size.height.full,
  },
  content: {
    ...CONTAINER.layout.flex.grow,
    ...CONTAINER.layout.justify.center,
    paddingHorizontal: CONTAINER.spacing["4xl"],
    paddingVertical: CONTAINER.spacing["4xl"],
  },
  centerContent: {
    ...CONTAINER.layout.flex.grow,
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.size.width.full,
    minHeight: 400,
    ...CONTAINER.padding.horizontal.lg,
  },

  // Form styles
  form: {
    ...CONTAINER.size.width.full,
    paddingVertical: 100,
    paddingHorizontal: CONTAINER.spacing["4xl"],
    ...CONTAINER.layout.align.center,
    ...CONTAINER.size.minHeight.full,
  },
  formContainer: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.layout.align.center,
  },

  // Title styles
  title: {
    ...TYPOGRAPHY.heading.h2,
    ...CONTAINER.margin.bottom.xl,
    ...CONTAINER.margin.top.none,
    textAlign: "center",
    color: COLORS.neutral.white,
  },
  titleLarge: {
    ...TYPOGRAPHY.heading.h1,
    ...CONTAINER.margin.bottom["3xl"],
    ...CONTAINER.margin.top.xl,
    color: COLORS.neutral.white,
  },

  // Input styles
  input: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.border.bottom.thin,
    borderBottomColor: COLORS.light.ui.border,
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.specialized.input,
    ...CONTAINER.padding.vertical.base,
    ...CONTAINER.padding.horizontal.sm,
  },
  passwordContainer: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.layout.position.relative,
    ...CONTAINER.margin.bottom["2xl"],
  },
  passwordInput: {
    ...CONTAINER.margin.bottom.none,
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    ...CONTAINER.layout.position.absolute,
    right: 0,
    ...CONTAINER.size.height.full,
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.padding.horizontal.md,
    ...CONTAINER.padding.bottom.md,
  },

  // Error and message styles
  error: {
    ...CONTAINER.margin.bottom.xl,
    textAlign: "center",
  },
  message: {
    ...CONTAINER.margin.bottom.xl,
    textAlign: "center",
  },
  errorContainer: {
    ...CONTAINER.layout.position.absolute,
    bottom: 140,
    left: 0,
    right: 0,
    ...CONTAINER.layout.align.center,
  },
  passwordMismatchText: {
    color: COLORS.semantic.error,
    ...TYPOGRAPHY.body.small,
    ...CONTAINER.margin.top.sm,
    ...CONTAINER.margin.bottom.sm,
  },

  // Forgot password styles
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    ...CONTAINER.margin.bottom["3xl"],
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.body.medium,
    textDecorationLine: "underline",
    color: COLORS.neutral.white,
  },

  // Social button styles
  socialContainer: {
    ...CONTAINER.margin.bottom["3xl"],
    ...CONTAINER.gap.lg,
  },
  socialButton: {
    ...CONTAINER.size.width.full,
  },
  socialButtons: {
    ...CONTAINER.size.width.full,
    height: 100,
    ...CONTAINER.layout.direction.column,
    ...CONTAINER.layout.justify.between,
    ...CONTAINER.margin.top["3xl"],
  },
  socialButtonText: {
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.body.large,
  },

  // Sign up/in text styles
  signupContainer: {
    ...CONTAINER.margin.bottom["3xl"],
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.gap.sm,
  },
  signupText: {
    textAlign: "center",
  },
  signInTextContainer: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.layout.justify.start,
    ...CONTAINER.size.width.full,
    ...CONTAINER.margin.top.base,
    ...CONTAINER.margin.bottom.md,
  },
  signInText: {
    color: COLORS.light.ui.border,
    ...TYPOGRAPHY.body.medium,
    ...CONTAINER.margin.top.xl,
    ...CONTAINER.margin.bottom.xl,
    textAlign: "left",
  },

  // Action button styles
  actionButtonContainer: {
    ...CONTAINER.layout.position.absolute,
    bottom: 70,
    left: 0,
    right: 0,
    ...CONTAINER.layout.align.center,
  },
  signinButton: {
    ...CONTAINER.size.width.full,
  },
  signupButton: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.margin.top.md,
    ...CONTAINER.border.width.thin,
    borderColor: COLORS.neutral.white,
    ...CONTAINER.border.radius.base,
    ...CONTAINER.padding.vertical.lg,
    ...CONTAINER.layout.align.center,
    backgroundColor: "transparent",
  },
  signupButtonText: {
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.button.medium,
  },
  verifyButton: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.margin.top.md,
  },
  // Email verification styles
  emailBody: {
    color: COLORS.light.ui.border,
    ...CONTAINER.margin.bottom.xl,
    textAlign: "center",
  },
  emailBold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  verificationInput: {
    textAlign: "center",
    ...TYPOGRAPHY.heading.h3,
    color: COLORS.neutral.white,
  },
  resendContainer: {
    ...CONTAINER.margin.top.xl,
    ...CONTAINER.layout.align.center,
  },
  resendTouchableEnabled: {
    ...CONTAINER.opacity.full,
  },
  resendTouchableDisabled: {
    ...CONTAINER.opacity.high,
  },
  resendText: {
    color: COLORS.brand.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  placeholderText: {
    color: COLORS.light.ui.border,
    ...CONTAINER.margin.bottom.md,
  },
  // Generic spacer
  spacer20: {
    height: CONTAINER.spacing.xl,
  },

  // Checkbox styles
  checkboxRow: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.layout.align.start,
    ...CONTAINER.margin.top.xl,
    ...CONTAINER.margin.bottom["3xl"],
    ...CONTAINER.size.width.full,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    ...CONTAINER.border.width.thin,
    borderColor: COLORS.neutral.white,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.layout.justify.center,
    backgroundColor: COLORS.dark.background.primary,
  },
  checkboxBoxChecked: {
    borderColor: COLORS.brand.primary,
  },
  checkboxCheck: {
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.button.medium,
  },
  checkboxText: {
    color: COLORS.light.ui.border,
    ...TYPOGRAPHY.body.medium,
    ...CONTAINER.margin.left.md,
    ...CONTAINER.layout.flex.grow,
    flexWrap: "wrap",
    lineHeight: TYPOGRAPHY.lineHeights.normal,
  },

  // Link styles
  link: {
    textDecorationLine: "underline",
    color: COLORS.neutral.white,
  },

  // Password requirements styles
  passwordRequirements: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.margin.top.base,
    ...CONTAINER.margin.bottom.xl,
  },
  requirementText: {
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.body.medium,
    ...CONTAINER.margin.top.xs,
    ...CONTAINER.margin.bottom.xs,
  },
  requirementMet: {
    color: COLORS.light.text.tertiary,
    textDecorationLine: "line-through",
  },
  termsText: {
    color: COLORS.light.ui.border,
    ...TYPOGRAPHY.body.small,
    textAlign: "left",
    lineHeight: TYPOGRAPHY.lineHeights.base,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.body.small,
    ...CONTAINER.margin.bottom.sm,
  },

  // Terms checkbox styles
  termsContainer: {
    ...CONTAINER.size.width.full,
    ...CONTAINER.gap.base,
    ...CONTAINER.margin.vertical.base,
  },
  termsCheckboxRow: {
    ...CONTAINER.basic.row,
    ...CONTAINER.layout.align.start,
    ...CONTAINER.gap.base,
  },
  termsCheckboxBox: {
    width: 20,
    height: 20,
    borderWidth: CONTAINER.border.width.base.borderWidth,
    ...CONTAINER.layout.align.center,
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.margin.top.xs,
  },
  termsCheckboxBoxChecked: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.primary,
  },
  termsCheckboxBoxUnchecked: {
    borderColor: COLORS.neutral.white,
    backgroundColor: COLORS.light.ui.disabled,
  },
  termsTextContainer: {
    ...CONTAINER.layout.flex.grow,
  },
  termsTextRow: {
    ...CONTAINER.basic.row,
    flexWrap: "wrap",
    ...CONTAINER.layout.align.start,
  },

  // Loading and success styles
  loadingOverlay: {
    ...CONTAINER.layout.position.absolute,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...CONTAINER.layout.justify.center,
    ...CONTAINER.layout.align.center,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent overlay
    zIndex: 1000, // Ensure it's on top of all content
  },
  loadingText: {
    ...TYPOGRAPHY.body.large,
    color: COLORS.neutral.white,
    ...CONTAINER.margin.top.lg,
  },
  successTitle: {
    color: COLORS.neutral.white,
    ...TYPOGRAPHY.heading.h1,
    ...CONTAINER.margin.bottom.lg,
  },
  successText: {
    color: COLORS.light.text.secondary,
    ...TYPOGRAPHY.body.large,
    ...CONTAINER.margin.bottom.xl,
    textAlign: "center",
  },
});
