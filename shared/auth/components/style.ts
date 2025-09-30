import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    minHeight: 400,
    paddingHorizontal: 16,
  },

  // Form styles
  form: {
    width: "100%",
    paddingVertical: 100,
    paddingHorizontal: 40,
    alignItems: "center",
    minHeight: "100%",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },

  // Title styles
  title: {
    fontSize: TYPOGRAPHY.sizes["2xl"],
    fontWeight: TYPOGRAPHY.weights.normal,
    marginBottom: 20,
    marginTop: 0,
    textAlign: "center",
    color: "#FFFFFF",
  },
  titleLarge: {
    fontSize: TYPOGRAPHY.sizes["4xl"],
    marginBottom: 30,
    marginTop: 20,
    color: "#fff",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Input styles
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#B9B9B9",
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.lg,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 24,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 12,
  },

  // Error and message styles
  error: {
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    marginBottom: 20,
    textAlign: "center",
  },
  errorContainer: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  passwordMismatchText: {
    color: "#ff6b6b",
    fontSize: TYPOGRAPHY.sizes.base,
    marginTop: 4,
    marginBottom: 4,
  },

  // Forgot password styles
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.normal,
    textDecorationLine: "underline",
    color: "#FFFFFF",
  },

  // Social button styles
  socialContainer: {
    marginBottom: 30,
    gap: 16,
  },
  socialButton: {
    width: "100%",
  },
  socialButtons: {
    width: "100%",
    height: 100,
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 30,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.lg,
  },

  // Sign up/in text styles
  signupContainer: {
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  signupText: {
    textAlign: "center",
  },
  signInTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    marginTop: 8,
    marginBottom: 12,
  },
  signInText: {
    color: "#B9B9B9",
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "left",
  },

  // Action button styles
  actionButtonContainer: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  signinButton: {
    width: "100%",
  },
  signupButton: {
    width: "100%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  verifyButton: {
    width: "100%",
    marginTop: 10,
  },
  // Email verification styles
  emailBody: {
    color: "#B9B9B9",
    marginBottom: 20,
    textAlign: "center",
  },
  emailBold: {
    fontWeight: "600",
  },
  verificationInput: {
    textAlign: "center",
    fontSize: TYPOGRAPHY.sizes.xl,
    color: "#FFFFFF",
  },
  resendContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resendTouchableEnabled: {
    opacity: 1,
  },
  resendTouchableDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: "#6646EC",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  placeholderText: {
    color: "#B9B9B9",
    marginBottom: 10,
  },
  // Generic spacer
  spacer20: {
    height: 20,
  },

  // Checkbox styles
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 30,
    width: "100%",
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#181818",
  },
  checkboxBoxChecked: {
    borderColor: "#6646EC",
  },
  checkboxCheck: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  checkboxText: {
    color: "#B9B9B9",
    fontSize: TYPOGRAPHY.sizes.md,
    marginLeft: 12,
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },

  // Link styles
  link: {
    textDecorationLine: "underline",
    color: "#fff",
  },

  // Password requirements styles
  passwordRequirements: {
    width: "100%",
    marginTop: 8,
    marginBottom: 20,
  },
  requirementText: {
    color: "#FFFFFF",
    fontSize: TYPOGRAPHY.sizes.md,
    marginTop: 2,
    marginBottom: 2,
  },
  requirementMet: {
    color: "#A5A1A0",
    textDecorationLine: "line-through",
  },
  termsText: {
    color: "#B9B9B9",
    fontSize: TYPOGRAPHY.sizes.base,
    textAlign: "left",
    lineHeight: 18,
  },
  termsLink: {
    textDecorationLine: "underline",
    color: "#FFFFFF",
    fontSize: TYPOGRAPHY.sizes.base,
    marginBottom: 6,
  },

  // Terms checkbox styles
  termsContainer: {
    width: "100%",
    ...CONTAINER.gap.base,
    ...CONTAINER.margin.vertical.base,
  },
  termsCheckboxRow: {
    ...CONTAINER.basic.row,
    alignItems: "flex-start",
    ...CONTAINER.gap.base,
  },
  termsCheckboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    ...CONTAINER.margin.top.xs,
  },
  termsCheckboxBoxChecked: {
    borderColor: "#6646EC", // COLORS.primary
    backgroundColor: "#6646EC", // COLORS.primary
  },
  termsCheckboxBoxUnchecked: {
    borderColor: "#FFFFFF", // COLORS.white
    backgroundColor: "#666",
  },
  termsTextContainer: {
    flex: 1,
  },
  termsTextRow: {
    ...CONTAINER.basic.row,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  // Loading and success styles
  loadingText: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes.lg,
    marginTop: 16,
  },
  successTitle: {
    color: "#fff",
    fontSize: TYPOGRAPHY.sizes["4xl"],
    marginBottom: 16,
  },
  successText: {
    color: "grey",
    fontSize: TYPOGRAPHY.sizes.lg,
    marginBottom: 20,
    textAlign: "center",
  },
});
