import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfilePicturePreviewProps {
  currentImageUrl?: string;
  onPress?: () => void;
}

export default function ProfilePicturePreview({
  currentImageUrl,
  onPress,
}: ProfilePicturePreviewProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      Alert.alert(
        "Profile Picture",
        "Profile picture upload is available in the full app build. For now, you can update your profile information below.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} style={styles.avatarContainer}>
        <View style={styles.avatarBorder}>
          {currentImageUrl ? (
            <Image source={{ uri: currentImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Ionicons name="person" size={40} color="#6646EC" />
            </View>
          )}

          <View style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </View>

        <Text style={styles.editText}>Edit profile photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    height: "20%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    alignSelf: "center",
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatarBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#6646EC",
    position: "relative",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  placeholderAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#6646EC",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  editText: {
    position: "absolute",
    top: 140,
    fontSize: 10,
    color: "#575453",
    textAlign: "center",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
});
