import { Dimensions, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  form: {
    width: "100%",
    height: 500,
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    marginTop: 10,
    color: "#fff",
  },
  input: {
    width: "100%",
    borderBottomWidth: 0.5,
    borderBottomColor: "#B9B9B9",
    color: "#fff",
    fontSize: 14,
    marginBottom: 18,
    paddingVertical: 8,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    marginBottom: 18,
    paddingRight: 50, // Make room for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 0,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 20,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Dimensions.get("window").width < 380 ? 4 : 10,
    marginBottom: 10,
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
    color: "#fff",
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 18,
    paddingTop: 16,
  },
  link: {
    textDecorationLine: "underline",
  },
  signInText: {
    color: "#fff",
    width: "100%",
    fontSize: 12,
    marginTop: Dimensions.get("window").width < 380 ? 10 : 20,
    marginBottom: 18,
  },
  signupButton: {
    width: "100%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  passwordMismatchText: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  passwordRequirements: {
    width: "100%",
    marginTop: 8,
  },
  requirementMet: {
    color: "grey",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
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
