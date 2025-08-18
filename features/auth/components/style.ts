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
    fontSize: 20,
    fontWeight: "normal",
    marginBottom: 40,
    marginTop: 20,
    textAlign: "center",
    color: "#FFFFFF",
  },
  titleLarge: {
    fontSize: 24,
    marginBottom: 30,
    marginTop: 20,
    color: "#fff",
    fontWeight: "600",
  },

  // Input styles
  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#B9B9B9",
    color: "#fff",
    fontSize: 16,
    marginBottom: 24,
    paddingVertical: 12,
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
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },

  // Forgot password styles
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "normal",
    textDecorationLine: "none",
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
    fontSize: 16,
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
    marginTop: 20,
  },
  signInText: {
    color: "#B9B9B9",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "left",
  },

  // Action button styles
  actionButtonContainer: {
    position: "absolute",
    bottom: 60,
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
    fontSize: 16,
    fontWeight: "600",
  },
  verifyButton: {
    width: "100%",
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxText: {
    color: "#B9B9B9",
    fontSize: 14,
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
  requirementMet: {
    color: "#4CAF50",
  },

  // Loading and success styles
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
  },
  successTitle: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 16,
  },
  successText: {
    color: "grey",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});
