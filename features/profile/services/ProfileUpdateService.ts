import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { getClerkInstance } from "@clerk/clerk-expo";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";

interface UpdateResult {
    success: boolean;
    error?: string;
}

export class ProfileUpdateService {
    /**
     * Update user's name through Clerk
     */
    static async updateName(newName: string): Promise<UpdateResult> {
        try {
            const clerk = getClerkInstance();
            const currentUser = clerk.user;

            if (!currentUser) {
                return {
                    success: false,
                    error: "User must be authenticated to update profile",
                };
            }

            // Split name into first and last name
            const nameParts = newName.trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Validate name parts
            if (!firstName.trim()) {
                return {
                    success: false,
                    error: "Please enter at least a first name",
                };
            }

            // Update via Clerk
            await currentUser.update({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });

            // Provide haptic feedback for success
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            return { success: true };
        } catch (error) {
            GlobalErrorHandler.logError(error, "PROFILE_UPDATE_NAME_FAILED", {
                newName,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            const errorMessage =
                error instanceof Error && error.message.includes("network")
                    ? "Network error. Please check your connection and try again."
                    : "Failed to update name. Please try again.";

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Update user's email through Clerk
     * Note: This typically requires email verification
     */
    static async updateEmail(newEmail: string): Promise<UpdateResult> {
        try {
            const clerk = getClerkInstance();
            const currentUser = clerk.user;

            if (!currentUser) {
                return {
                    success: false,
                    error: "User must be authenticated to update profile",
                };
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return {
                    success: false,
                    error: "Please enter a valid email address",
                };
            }

            // Create new email address (this will require verification)
            await currentUser.createEmailAddress({ email: newEmail });

            return { success: true };
        } catch (error) {
            GlobalErrorHandler.logError(error, "PROFILE_UPDATE_EMAIL_FAILED", {
                newEmail,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            const errorMessage =
                error instanceof Error && error.message.includes("already")
                    ? "This email is already in use by another account"
                    : "Failed to update email. Please try again.";

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Show success message to user
     */
    static showSuccessMessage(message: string) {
        Alert.alert("Success", message);
    }

    /**
     * Show error message to user
     */
    static showErrorMessage(message: string) {
        Alert.alert("Error", message);
    }

    /**
     * Sync current user data from Clerk
     */
    static getCurrentUserData() {
        try {
            const clerk = getClerkInstance();
            const currentUser = clerk.user;

            if (!currentUser) {
                return null;
            }

            return {
                id: currentUser.id,
                firstName: currentUser.firstName || "",
                lastName: currentUser.lastName || "",
                fullName: currentUser.fullName || "",
                email: currentUser.emailAddresses[0]?.emailAddress || "",
                phone: currentUser.phoneNumbers[0]?.phoneNumber || "",
                avatarUrl: currentUser.imageUrl || "",
            };
        } catch (error) {
            GlobalErrorHandler.logError(error, "PROFILE_GET_USER_DATA_FAILED");
            return null;
        }
    }
}
