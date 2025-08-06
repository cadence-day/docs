import { supabase } from "@/shared/utils/supabase";

/**
 * Ensures a user profile exists with the correct full name
 * This is a utility function to handle cases where the profile trigger
 * might not have created a profile or the full name wasn't properly set
 *
 * @param userId - The user ID
 * @param fullName - The full name to set
 * @param email - The user's email
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export const ensureProfileWithFullName = async (
    userId: string,
    fullName: string,
    email: string,
): Promise<boolean> => {
    try {
        // Update both user metadata and profile
        await Promise.all([
            // Update user metadata
            supabase.auth.updateUser({
                data: { full_name: fullName },
            }),

            // Upsert profile to ensure it exists with correct data
            supabase
                .from("profiles")
                .upsert({
                    user_id: userId,
                    email: email,
                    full_name: fullName,
                }, {
                    onConflict: "user_id",
                }),
        ]);

        return true;
    } catch (error) {
        console.error("Failed to ensure profile with full name:", error);
        return false;
    }
};

/**
 * Gets the user's current profile and checks if full name is set
 * @param userId - The user ID
 * @returns Promise with profile data or null
 */
export const getUserProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
};
