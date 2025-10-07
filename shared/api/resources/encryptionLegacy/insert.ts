import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { EncryptionLegacy } from "@/shared/types/models";
import { getClerkInstance } from "@clerk/clerk-expo";

/**
 * Inserts a new EncryptionLegacy object into the database.
 * @param encryptionKey - The EncryptionLegacy object to insert (without user_id).
 * @returns A promise that resolves to the inserted EncryptionLegacy object or null if insertion fails.
 */
export async function insertEncryptionKey(
    encryptionKey: Omit<EncryptionLegacy, "user_id">,
): Promise<EncryptionLegacy | null> {
    try {
        // Get current user ID from Clerk
        const clerk = getClerkInstance();
        const currentUserId = clerk.user?.id;

        if (!currentUserId) {
            throw new Error(
                "User must be authenticated to set an encryption key",
            );
        }

        // Add user_id to the state
        const encryptionKeyWithUserId = {
            ...encryptionKey,
            user_id: currentUserId,
        };

        return await apiCall(async () => {
            const { data, error } = await supabaseClient
                .from("encryption_legacy")
                .insert(encryptionKeyWithUserId)
                .select()
                .single();
            return { data, error };
        });
    } catch (error) {
        handleApiError("insertEncryptionKey", error);
    }
}
