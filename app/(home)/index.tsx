import { SignOutButton } from "@/shared/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { StyleSheet, Text, View } from "react-native";
import SignIn from "../(auth)/sign-in";

export default function Page() {
  const { user } = useUser();
  const firstName = user?.firstName || "User";
  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.signedInSection}>
          <Text style={styles.welcomeText}>Welcome back, {firstName}!</Text>
          <SignOutButton />
        </View>
      </SignedIn>
      <SignedOut>
        <SignIn />
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignContent: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  signedInSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
});
