import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import useDialogStore from "@/shared/stores/useDialogStore";
import { CdButton, CdText } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const openDialog = useDialogStore((s) => s.openDialog);

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const buildNumber =
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.ios?.buildNumber ||
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.android?.versionCode ||
    "Unknown";

  const onEditPhoto = () => {
    openDialog({
      type: "profile-image-picker",
      props: {
        currentImageUrl: user?.imageUrl ?? null,
        onImageSelected: (url: string) => {
          // In this skeleton we do not persist to Clerk; caller can hook later.
          // Close happens inside dialog after selection.
        },
        height: 60,
        headerProps: { title: "Change Profile Photo" },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onEditPhoto} activeOpacity={0.8}>
          <View style={styles.avatarWrapper}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]} />
            )}
          </View>
        </TouchableOpacity>
        <CdText variant="body" size="medium" style={styles.name}>
          {user?.fullName || user?.username || "Your Name"}
        </CdText>
        <Text style={styles.subtle}>
          {user?.emailAddresses?.[0]?.emailAddress || "no-email@example.com"}
        </Text>
      </View>

      <View style={styles.section}>
        <CdText variant="body" size="medium" style={styles.sectionTitle}>
          Account
        </CdText>
        <View style={styles.row}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user?.id?.slice(-8) || "Unknown"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>App Version</Text>
          <Text style={styles.value}>
            {appVersion} ({buildNumber})
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <CdText variant="body" size="medium" style={styles.sectionTitle}>
          Photo
        </CdText>
        <CdButton title="Change Photo" onPress={onEditPhoto} variant="outline" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { alignItems: "center", marginBottom: 16 },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { backgroundColor: "#ccc" },
  name: { marginTop: 12, color: COLORS.text.header },
  subtle: { color: "#666", marginTop: 4 },
  section: { backgroundColor: "#fff", padding: 16, borderRadius: 8, marginBottom: 12 },
  sectionTitle: { color: COLORS.text.header, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  label: { color: "#555" },
  value: { color: "#111" },
});

export default ProfileScreen;

