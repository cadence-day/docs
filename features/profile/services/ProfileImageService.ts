import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { getClerkInstance } from "@clerk/clerk-expo";

// Dynamic imports for native modules
let ImagePicker: any = null;
let ImageManipulator: any = null;

// Lazy load native modules
const loadNativeModules = async () => {
  try {
    if (!ImagePicker) {
      const module = await import("expo-image-picker");
      ImagePicker = module.default || module;
    }
    if (!ImageManipulator) {
      const module = await import("expo-image-manipulator");
      ImageManipulator = module.default || module;
    }
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

  /**
   * Launch image picker with camera and gallery options
   */
  static async pickImage(): Promise<ImagePickerResult | null> {
    try {
      const modules = await loadNativeModules();
      if (!modules) {
        throw new Error("Image picker not available in this build");
      }

      const { ImagePicker } = modules;

      // Request permissions
      const { status } = await ImagePicker
        .requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media library permission required");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // Use array with string instead of enum
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 1, // Full quality, we'll compress later
      });

      return result;
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_IMAGE_PICKER_FAILED");
      return null;
    }
  }

  /**
   * Launch camera for taking a new photo
   */
  static async takePhoto(): Promise<ImagePickerResult | null> {
    try {
      const modules = await loadNativeModules();
      if (!modules) {
        throw new Error("Camera not available in this build");
      }

      const { ImagePicker } = modules;

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Camera permission required");
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"], // Use array with string instead of enum
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 1, // Full quality, we'll compress later
      });

      return result;
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_CAMERA_FAILED");
      return null;
    }
  }

  /**
   * Compress and resize image for optimal upload
   */
  private static async processImage(uri: string): Promise<string> {
    try {
      const modules = await loadNativeModules();
      if (!modules) {
        // If image manipulator is not available, return the original URI
        return uri;
      }

      const { ImageManipulator } = modules;

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: this.MAX_WIDTH,
              height: this.MAX_HEIGHT,
            },
          },
        ],
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
      // If processing fails, return the original URI
      return uri;
    }
  }

  /**
   * Convert image URI to base64 string for Clerk compatibility
   */
  private static async convertToBase64(uri: string): Promise<string> {
    try {
      // Fetch the image file
      const response = await fetch(uri);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      // Get the image as array buffer
      const arrayBuffer = await response.arrayBuffer();

      // Convert array buffer to binary string in chunks to avoid
      // quadratic string concatenation and stack/argument size limits.
      const bytes = new Uint8Array(arrayBuffer);

      // If the environment provides a direct way to convert to base64 from
      // a byte array (like Node's Buffer), use it. Otherwise fall back to
      // chunked String.fromCharCode + btoa approach which is safe for
      // large arrays in JS engines.
      let base64String: string;

      // Browser/React Native: try using btoa on chunks
      try {
        const CHUNK_SIZE = 0x8000; // 32KB per chunk — tuned for performance/safety
        const chunks: string[] = [];
        for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
          const slice = bytes.subarray(i, i + CHUNK_SIZE);
          // Use apply-safe conversion for the slice
          chunks.push(String.fromCharCode.apply(null, Array.from(slice)));
        }
        const binary = chunks.join("");
        base64String = (globalThis as any).btoa(binary);
      } catch (e) {
        // Fallback for environments where apply or btoa is not available
        // (for example, some JS runtimes). Try Node Buffer if available.
        if (typeof Buffer !== "undefined") {
          base64String = Buffer.from(bytes).toString("base64");
        } else {
          throw e;
        }
      }

      // Return with data URL format that Clerk expects
      return `data:image/jpeg;base64,${base64String}`;
    } catch (error) {
      GlobalErrorHandler.logError(error, "BASE64_CONVERSION_FAILED", { uri });
      throw new Error("Failed to convert image to base64");
    }
  }

  /**
   * Upload image directly to Clerk
   */
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

      // Process the image first
      const processedUri = await this.processImage(imageUri);

      // Convert image to base64 format for Clerk
      const base64Image = await this.convertToBase64(processedUri);

      // Check file size by estimating from base64 length
      // Base64 adds ~33% overhead, so actual size is roughly base64Length * 0.75
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

      // Upload directly to Clerk using base64 string
      await currentUser.setProfileImage({ file: base64Image });

      // Get the updated profile image URL from Clerk
      const updatedUser = await currentUser.reload();
      const profileImageUrl = updatedUser.imageUrl;

      if (!profileImageUrl) {
        return {
          success: false,
          error: "Failed to get updated profile image URL from Clerk",
        };
      }

      return {
        success: true,
        url: profileImageUrl,
      };
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

  /**
   * Remove profile image from Clerk
   */
  static async deleteImage(): Promise<boolean> {
    const clerk = getClerkInstance();
    const currentUser = clerk.user;

    try {
      if (!currentUser) {
        return false;
      }

      // Remove profile image from Clerk by setting it to null
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

  /**
   * Show action sheet for image selection (camera vs gallery)
   */
  static async showImagePicker(): Promise<ImagePickerResult | null> {
    // For now, just use the gallery picker
    // In the future, this could show an action sheet with camera/gallery options
    return this.pickImage();
  }
}
