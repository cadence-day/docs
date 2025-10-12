import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { apiCall } from "@/shared/api/utils/apiHelpers";
import { handleApiError } from "@/shared/api/utils/errorHandler";
import type { EncryptionLegacy } from "@/shared/types/models";

/**
 * Fetches all encryption legacy keys.
 * @returns A promise that resolves to an array of all encryption legacy keys.
 */
export async function getAllEncryptionLegacyKeys(): Promise<
    EncryptionLegacy[]
> {
    try {
        return await apiCall(async () => {
            const { data, error } = await supabaseClient.from(
                "encryption_legacy",
            ).select(
                "*",
            );
            return { data: data ?? [], error };
        });
    } catch (error) {
        handleApiError("getAllEncryptionLegacyKeys", error);
    }
}
