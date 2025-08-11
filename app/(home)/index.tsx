import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
import { SignOutButton } from "@/shared/components/SignOutButton";
import SignIn from "@/features/auth/components/screens/Sign-in";

export default function Page() {
  const { user } = useUser();

  return (
    <View style={styles.container}>

      <SignedIn>
        <View style={styles.signedInSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userEmail}>{user?.emailAddresses[0].emailAddress}</Text>
          <SignOutButton />
        </View>
      </SignedIn>

      <SignedOut>
        {/* <View style={styles.authSection}>
          <Text style={styles.authTitle}>Get Started</Text>
          <Text style={styles.authSubtitle}>Sign in to your account or create a new one</Text>
          
          <View style={styles.buttonContainer}>
            <Link href="/(auth)/sign-in" asChild>
              <View style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </View>
            </Link>
            
            <Link href="/(auth)/sign-up" asChild>
              <View style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Sign Up</Text>
              </View>
            </Link>
          </View>
        </View> */}
        <SignIn/>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    width: "100%",
    height: "100%",
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
  userEmail: {
    fontSize: 18,
    color: "#555",
    marginBottom: 20,
  },
  // authSection: {
  //   backgroundColor: "#fff",
  //   padding: 20,
  //   borderRadius: 10,
  //   shadowColor: "#000",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  // authTitle: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "#333",
  //   marginBottom: 10,
  // },
  // authSubtitle: {
  //   fontSize: 16,
  //   color: "#666",
  //   marginBottom: 20,
  // },
  // buttonContainer: {
  //   flexDirection: "row",
  //   justifyContent: "space-around",
  // },
  // primaryButton: {
  //   backgroundColor: "#007bff",
  //   paddingVertical: 12,
  //   paddingHorizontal: 25,
  //   borderRadius: 8,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // primaryButtonText: {
  //   color: "#fff",
  //   fontSize: 18,
  //   fontWeight: "bold",
  // },
  // secondaryButton: {
  //   backgroundColor: "#6c757d",
  //   paddingVertical: 12,
  //   paddingHorizontal: 25,
  //   borderRadius: 8,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // secondaryButtonText: {
  //   color: "#fff",
  //   fontSize: 18,
  //   fontWeight: "bold",
  // },
});
