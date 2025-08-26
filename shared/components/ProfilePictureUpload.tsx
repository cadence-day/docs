import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  uploadProfilePicture,
  deleteProfilePicture,
} from "@/shared/api/storage";
import useProfileStore from "@/shared/stores/useProfileStore";
import { useAuth } from "@/features/auth";
import {
  uriToBlob,
  isFileSizeValid,
  formatFileSize,
  generateProfilePictureFileName,
  getFileExtension,
} from "@/shared/utils/imageUtils";

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(
    currentImageUrl || null
  );
  const [isImagePickerAvailable, setIsImagePickerAvailable] = useState(true);
  const { updateProfileData } = useProfileStore();
  const { user } = useAuth();

  // Check if ImagePicker is available
  React.useEffect(() => {
    const checkImagePickerAvailability = async () => {
      try {
        // Try to call a simple ImagePicker method to see if it's available
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        setIsImagePickerAvailable(true);
      } catch (error) {
        console.warn("ImagePicker not available:", error);
        setIsImagePickerAvailable(false);
      }
    };

    checkImagePickerAvailability();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to upload profile pictures!"
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting media library permissions:", error);
      Alert.alert(
        "Error",
        "Unable to request permissions. Image picker may not be available in this environment."
      );
      return false;
    }
  };

  const pickImage = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (5MB limit)
        if (asset.fileSize && !isFileSizeValid(asset.fileSize)) {
          Alert.alert(
            "File Too Large",
            `Please select an image smaller than 5MB. Current size: ${formatFileSize(asset.fileSize)}`
          );
          return;
        }

        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image from library:", error);
      Alert.alert(
        "Error",
        "Failed to access image library. Please make sure you have granted permissions and try again."
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera permissions to take profile pictures!"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (5MB limit)
        if (asset.fileSize && !isFileSizeValid(asset.fileSize)) {
          Alert.alert(
            "File Too Large",
            `Please take a smaller photo. Current size: ${formatFileSize(asset.fileSize)}`
          );
          return;
        }

        await uploadImage(asset.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert(
        "Error",
        "Failed to access camera. Please make sure you have granted permissions and try again."
      );
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setIsUploading(true);

    try {
      // Convert URI to blob
      const blob = await uriToBlob(uri);

      // Generate filename with proper extension
      const extension = getFileExtension(uri);
      const fileName = generateProfilePictureFileName(user.id, extension);

      const { data, error } = await uploadProfilePicture(
        blob,
        user.id,
        fileName
      );

      if (error) {
        throw error;
      }

      if (data?.publicUrl) {
        setImageUri(data.publicUrl);

        // Update profile with new avatar URL
        await updateProfileData({
          avatar_url: data.publicUrl,
        });

        onUploadSuccess?.(data.publicUrl);
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      console.error("Upload error:", error);
      onUploadError?.(errorMessage);
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async () => {
    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (user?.id) {
              try {
                // Update profile to remove avatar URL
                await updateProfileData({ avatar_url: null });
                setImageUri(null);
                Alert.alert("Success", "Profile picture removed successfully!");
              } catch (error) {
                console.error("Remove error:", error);
                Alert.alert("Error", "Failed to remove profile picture");
              }
            }
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    if (!isImagePickerAvailable) {
      Alert.alert(
        "Feature Not Available",
        "Image picker is not available in this environment. Please try using a development build or check if you're running in Expo Go."
      );
      return;
    }

    Alert.alert("Profile Picture", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      ...(imageUri
        ? [
            {
              text: "Remove Photo",
              onPress: removeImage,
              style: "destructive" as const,
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={showImageOptions}
        style={styles.avatarContainer}
        disabled={isUploading || !isImagePickerAvailable}
      >
        <View style={styles.avatarBorder}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Ionicons name="person" size={40} color="#6646EC" />
            </View>
          )}

          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}

          <View style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </View>

        <Text style={styles.editText}>
          {isUploading
            ? "Uploading..."
            : !isImagePickerAvailable
              ? "Image picker unavailable"
              : "Edit profile photo"}
        </Text>
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
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
