import { CdTextInputOneLine } from "@/shared/components/CadenceUI/CdTextInputOneLine";
import { useErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsPage() {
  const { logDebug } = useErrorHandler();
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthDataAccess, setHealthDataAccess] = useState(false);
  const router = useRouter();

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      "Notifications",
      `Notifications ${!notificationsEnabled ? "enabled" : "disabled"}`
    );
  };

  const toggleHealthData = () => {
    setHealthDataAccess(!healthDataAccess);
    Alert.alert(
      "Health Data",
      `Health data access ${!healthDataAccess ? "enabled" : "disabled"}`
    );
  };

  const contactSupport = () => {
    const email = 'support@cadenceapp.com';
    const subject = 'Support Request';
    const body = `User ID: ${user?.id}\nApp Version: ${Constants.expoConfig?.version}\n\nDescribe your issue here...`;
    
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`);
  };

  const openAppInformation = () => {
    Alert.alert(
      "App Information",
      `Version: ${Constants.expoConfig?.version || 'Unknown'}\nBuild: ${Constants.expoConfig?.extra?.buildNumber || 'Unknown'}\nPlatform: ${Constants.platform?.ios ? 'iOS' : 'Android'}`,
      [{ text: "OK" }]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingHorizontal: 12 }}
            >
              <Text style={{ color: "#007bff", fontSize: 16 }}>Back</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <CdTextInputOneLine
            label="Push Notifications"
            value={notificationsEnabled ? "Enabled" : "Disabled"}
            isButton={true}
            onPress={toggleNotifications}
            buttonIcon={notificationsEnabled ? "notifications" : "notifications-off"}
          />
          
          <CdTextInputOneLine
            label="Email Notifications"
            value="Configure email preferences"
            isButton={true}
            onPress={() => Alert.alert("Coming Soon", "Email notification settings will be available soon")}
            buttonIcon="mail"
          />
        </View>

        {/* Health & Data Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Data</Text>
          
          <CdTextInputOneLine
            label="Health Data Access"
            value={healthDataAccess ? "Enabled" : "Disabled"}
            isButton={true}
            onPress={toggleHealthData}
            buttonIcon={healthDataAccess ? "fitness" : "fitness-outline"}
          />
          
          <CdTextInputOneLine
            label="Data Export"
            value="Export your data"
            isButton={true}
            onPress={() => Alert.alert("Coming Soon", "Data export feature will be available soon")}
            buttonIcon="download"
          />
          
          <CdTextInputOneLine
            label="Privacy Settings"
            value="Manage data privacy"
            isButton={true}
            onPress={() => Alert.alert("Coming Soon", "Privacy settings will be available soon")}
            buttonIcon="shield-checkmark"
          />
        </View>

        {/* Support & Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Information</Text>
          
          <CdTextInputOneLine
            label="Contact Support"
            value="Get help and support"
            isButton={true}
            onPress={contactSupport}
            buttonIcon="help-circle"
          />
          
          <CdTextInputOneLine
            label="App Information"
            value="Version and build details"
            isButton={true}
            onPress={openAppInformation}
            buttonIcon="information-circle"
          />
          
          <CdTextInputOneLine
            label="User ID"
            value={user?.id || "Not available"}
            editable={false}
          />
          
          <CdTextInputOneLine
            label="App Version"
            value={Constants.expoConfig?.version || "Unknown"}
            editable={false}
          />
        </View>

        {/* Development Tools (if in dev mode) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Development Tools</Text>
            
            <CdTextInputOneLine
              label="Test Error Reporting"
              value="Test Sentry integration"
              isButton={true}
              onPress={() => router.push("/sentry-test")}
              buttonIcon="bug"
            />
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bottomPadding: {
    height: 40,
  },
});
