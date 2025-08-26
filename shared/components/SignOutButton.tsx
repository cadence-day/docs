import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/COLORS";
import { GlobalErrorHandler } from "../utils/errorHandler";

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      router.replace("/");
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      GlobalErrorHandler.logError(err, "SIGN_OUT", {
        component: "SignOutButton",
        operation: "clerk_sign_out",
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut} style={styles.button}>
      <Text style={styles.buttonText}>Sign out</Text>
    </TouchableOpacity>
  );
};

export const styles = StyleSheet.create({
  button: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    paddingVertical: 12,
    marginTop: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});
