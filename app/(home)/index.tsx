import { SignOutButton } from "@/shared/components/SignOutButton";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignIn from "../(auth)/sign-in";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const firstName = user?.firstName || "User";

  const navigateToSentryTest = () => {
    router.push("./sentry-test");
  };

  const navigateToSettings = () => {
    router.push("./settings");
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <View style={styles.signedInSection}>
          <Text style={styles.welcomeText}>Welcome back, {firstName}!</Text>
          <SignOutButton />

          {/* App Navigation */}
          <View style={styles.navigationSection}>
            <Text style={styles.navigationTitle}>App Features</Text>
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={navigateToSettings}
            >
              <Text style={styles.navigationButtonText}>⚙️ Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Development/Debug Links */}
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Development Tools</Text>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={navigateToSentryTest}
            >
              <Text style={styles.debugButtonText}>
                🔧 Test Sentry Integration
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => router.push("/(utils)/not-found" as any)}
            >
              <Text style={styles.debugButtonText}>🚫 Test Not Found Page</Text>
            </TouchableOpacity>
          </View>
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
  navigationSection: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navigationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  navigationButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  navigationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  debugSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    width: "100%",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
    textAlign: "center",
  },
  debugButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
