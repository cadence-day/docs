import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SignOutButton } from "@/shared/components/SignOutButton";

export default function Page() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Page</Text>

      <SignedIn>
        <Text style={styles.welcomeText}>Hello {user?.emailAddresses[0].emailAddress}</Text>
        
        <View style={styles.navigationContainer}>
          <Link href="./activities" asChild>
            <TouchableOpacity style={styles.navButton}>
              <Text style={styles.navButtonText}>🏃‍♂️ Manage Activities</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        <View style={styles.signOutContainer}>
          <SignOutButton />
        </View>
      </SignedIn>

      <SignedOut>
        <View style={styles.authContainer}>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity style={styles.authButton}>
              <Text style={styles.authButtonText}>Sign in</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity style={styles.authButton}>
              <Text style={styles.authButtonText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    color: "#374151",
    textAlign: "center",
    marginBottom: 30,
  },
  navigationContainer: {
    marginBottom: 30,
  },
  navButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutContainer: {
    alignItems: "center",
  },
  authContainer: {
    gap: 12,
  },
  authButton: {
    backgroundColor: "#6b7280",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
