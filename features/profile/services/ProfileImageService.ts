import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { getClerkInstance } from "@clerk/clerk-expo";
import type * as ExpoImageManipulator from "expo-image-manipulator";
import type * as ExpoImagePicker from "expo-image-picker";

// Dynamic imports for native modules
let ImagePicker: typeof ExpoImagePicker | null = null;
let ImageManipulator: typeof ExpoImageManipulator | null = null;

// Lazy load native modules
const loadNativeModules = async (): Promise<
  {
    ImagePicker: typeof ExpoImagePicker;
    ImageManipulator: typeof ExpoImageManipulator;
  } | null
> => {
  try {
    if (!ImagePicker) {
      const module = await import("expo-image-picker");
      ImagePicker = module;
    }
    if (!ImageManipulator) {
      const module = await import("expo-image-manipulator");
      ImageManipulator = module;
    }
    if (!ImagePicker || !ImageManipulator) return null;
    return { ImagePicker, ImageManipulator };
  } catch (error) {
    GlobalErrorHandler.logError(error, "NATIVE_MODULES_NOT_AVAILABLE");
    return null;
  }
};

export interface ImageUploadResult {
  url: string;
  success: true;
}

export interface ImageUploadError {
  error: string;
  success: false;
}

export type ImageUploadResponse = ImageUploadResult | ImageUploadError;

// Type for image picker result
export interface ImagePickerResult {
  canceled: boolean;
  assets?: {
    uri: string;
    width?: number;
    height?: number;
    type?: string;
  }[];
}

export class ProfileImageService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly MAX_WIDTH = 1024;
  private static readonly MAX_HEIGHT = 1024;
  private static readonly JPEG_QUALITY = 0.8;

  static async pickImage(): Promise<ImagePickerResult | null> {
    try {
      const modules = await loadNativeModules();
      if (!modules) {
        throw new Error("Image picker not available in this build");
      }

      const { ImagePicker } = modules;

      const { status } = await ImagePicker
        .requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media library permission required");
      }

      return await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      }) as ImagePickerResult;
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_IMAGE_PICKER_FAILED");
      return null;
    }
  }

  static async takePhoto(): Promise<ImagePickerResult | null> {
    try {
      const modules = await loadNativeModules();
      if (!modules) {
        throw new Error("Camera not available in this build");
      }

      const { ImagePicker } = modules;

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Camera permission required");
      }

      return await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      }) as ImagePickerResult;
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_CAMERA_FAILED");
      return null;
    }
  }

  private static async processImage(uri: string): Promise<string> {
    try {
      const modules = await loadNativeModules();
      if (!modules) return uri;

      const { ImageManipulator } = modules;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: this.MAX_WIDTH, height: this.MAX_HEIGHT } }],
        {
          compress: this.JPEG_QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      return result.uri;
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_IMAGE_PROCESSING_FAILED", {
        originalUri: uri,
      });
      return uri;
    }
  }

  private static async convertToBase64(uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      let base64String: string;
      try {
        const CHUNK_SIZE = 0x8000;
        const chunks: string[] = [];
        for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
          const slice = bytes.subarray(i, i + CHUNK_SIZE);
          chunks.push(String.fromCharCode.apply(null, Array.from(slice)));
        }
        const binary = chunks.join("");
        base64String = globalThis.btoa(binary);
      } catch {
        if (typeof Buffer !== "undefined") {
          base64String = Buffer.from(bytes).toString("base64");
        } else {
          throw new Error("No base64 conversion available");
        }
      }
      return `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      GlobalErrorHandler.logError(error, "BASE64_CONVERSION_FAILED", { uri });
      throw new Error("Failed to convert image to base64");
    }
  }

  static async uploadImage(imageUri: string): Promise<ImageUploadResponse> {
    try {
      const clerk = getClerkInstance();
      const currentUser = clerk.user;
      if (!currentUser) {
        return {
          success: false,
          error: "User must be authenticated to upload profile images",
        };
      }

      const processedUri = await this.processImage(imageUri);
      const base64Image = await this.convertToBase64(processedUri);

      const estimatedSize =
        (base64Image.length - "data:image/jpeg;base64,".length) * 0.75;
      if (estimatedSize > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: `Image too large. Maximum size is ${
            this.MAX_FILE_SIZE / (1024 * 1024)
          }MB`,
        };
      }

      await currentUser.setProfileImage({ file: base64Image });
      const updatedUser = await currentUser.reload();
      const profileImageUrl = updatedUser.imageUrl;

      if (!profileImageUrl) {
        return {
          success: false,
          error: "Failed to get updated profile image URL from Clerk",
        };
      }

      return { success: true, url: profileImageUrl };
    } catch (error) {
      GlobalErrorHandler.logError(error, "CLERK_PROFILE_IMAGE_UPLOAD_FAILED", {
        imageUri,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {
        success: false,
        error: error instanceof Error
          ? error.message
          : "Unexpected error during image upload",
      };
    }
  }

  static async deleteImage(): Promise<boolean> {
    const clerk = getClerkInstance();
    const currentUser = clerk.user;
    try {
      if (!currentUser) return false;
      await currentUser.setProfileImage({ file: null });
      return true;
    } catch (error) {
      GlobalErrorHandler.logError(error, "CLERK_PROFILE_IMAGE_DELETE_FAILED", {
        userId: currentUser?.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  static async showImagePicker(): Promise<ImagePickerResult | null> {
    return this.pickImage();
  }
}
