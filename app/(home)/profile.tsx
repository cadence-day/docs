import { getEncryptionKey } from "@/shared/api/encryption";
import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { backgroundLinearColors, COLORS } from "@/shared/constants/COLORS";
import { DIALOG_HEIGHT_PLACEHOLDER } from "@/shared/constants/VIEWPORT";
import { useI18n } from "@/shared/hooks/useI18n";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SignIn from "../(auth)/sign-in";

export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useUser();
  const router = useRouter();
  const firstName = user?.firstName || t("user");

  const navigateToSentryTest = () => {
    router.push("/sentry-test");
  };

  const navigateToSettings = () => {
    router.push("/settings");
  };

  const updateFirstName = async (newName: string) => {
    try {
      await user?.update({ firstName: newName });
      Alert.alert("Success", "First name updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update first name");
    }
  };

  const updateLastName = async (newName: string) => {
    try {
      await user?.update({ lastName: newName });
      Alert.alert("Success", "Last name updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update last name");
    }
  };

  const copyEncryptionKey = async () => {
    try {
      const key = await getEncryptionKey();
      if (key) {
        // In a real app, you'd copy to clipboard
        Alert.alert("Encryption Key", `Key copied: ${key.substring(0, 20)}...`);
      } else {
        Alert.alert("No Key", "No encryption key found");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve encryption key");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // SignOutButton handles the actual logout
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await user?.delete();
              Alert.alert("Account Deleted", "Your account has been deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SignedIn>
        <LinearGradient
          colors={[
            backgroundLinearColors.primary.end,
            backgroundLinearColors.primary.end,
          ]}
          style={{ flex: 1 }}
        >
          <SafeAreaView style={styles.headerContainer}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titleText}>Profile</Text>
              <Text
                style={styles.welcomeText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("welcome-back")} {firstName}!
              </Text>
            </View>

            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  {user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user?.firstName?.[0]?.toUpperCase() ||
                          user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ||
                          "?"}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Information</Text>

              <CdTextInputOneLine
                label="First Name"
                value={user?.firstName || ""}
                onSubmit={updateFirstName}
              />

              <CdTextInputOneLine
                label="Last Name"
                value={user?.lastName || ""}
                onSubmit={updateLastName}
              />

              <CdTextInputOneLine
                label="Email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                editable={false}
              />
            </View>

            {/* Account Actions Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>

              <CdTextInputOneLine
                label="Logout"
                value="Sign out of your account"
                isButton={true}
                onPress={handleLogout}
                buttonIcon="log-out"
              />

              <CdTextInputOneLine
                label="Copy Encryption Key"
                value="Copy your secure key"
                isButton={true}
                onPress={copyEncryptionKey}
                buttonIcon="key"
              />

              <CdTextInputOneLine
                label="Delete Account"
                value="Permanently delete account"
                isButton={true}
                onPress={handleDeleteAccount}
                buttonIcon="trash"
              />
            </View>

            {/* Navigation Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>

              <CdTextInputOneLine
                label="App Settings"
                value="Notifications, data, and more"
                isButton={true}
                onPress={navigateToSettings}
                buttonIcon="settings"
              />
            </View>

            {/* Development Tools (if needed) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Development Tools</Text>

              <CdTextInputOneLine
                label="Test Sentry"
                value="Test error reporting"
                isButton={true}
                onPress={navigateToSentryTest}
                buttonIcon="bug"
              />

              <CdTextInputOneLine
                label="Test 404 Page"
                value="Test not found page"
                isButton={true}
                onPress={() => router.push("/(utils)/not-found")}
                buttonIcon="help"
              />
            </View>

            {/* Spacer to ensure there's room below the content */}
            <View style={{ height: DIALOG_HEIGHT_PLACEHOLDER }} />
          </ScrollView>
        </LinearGradient>
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
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    margin: 12,
  },
  titleText: {
    fontSize: 24,
    color: "#222",
  },
  welcomeText: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: "2%",
  },
  avatarContainer: {
    // No additional margin needed since it's in the header
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 2,
    backgroundColor: "#fff",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  section: {
    backgroundColor: "transparent",
    marginBottom: 20,
    gap: 5,
    paddingHorizontal: "2%",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444444",
    paddingBottom: 10,
    // uppercase
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
});
