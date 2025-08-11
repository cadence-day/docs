import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  form: {
    width: "95%",
    height: 500,
    alignItems: "center",
    marginTop: 200,
  },
  title: {
    fontSize: 20,
    marginBottom: 60,
    color: "#fff",
  },
  description: {
    color: "#fff",
    textAlign: "left",
    marginBottom: 20,
    fontSize: 14,
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
  link: {
    textDecorationLine: "underline",
  },
  resetButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // marginTop: 60,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
