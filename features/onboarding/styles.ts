import { StyleSheet } from "react-native";

export const onboardingStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: "center",
    flex: 1,
    width: "100%",
    padding: 20,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    width: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "absolute",
    width: "100%",
    top: "14%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.9,
  },
  actionButton: {
    paddingVertical: 8,
    width: 300,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  linkButton: {
    marginTop: 62,
    width: 200,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
  continueButton: {
    width: "100%",
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    borderBottomColor: "#FFFFFF",
    borderBottomWidth: 1,
  },
  footerText: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

export const sageIconStyles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});