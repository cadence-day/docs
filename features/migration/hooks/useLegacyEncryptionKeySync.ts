import {
    getAllEncryptionLegacyKeys,
    insertEncryptionKey,
} from "@/shared/api/resources";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useCallback, useState } from "react";
import { getLegacyEncryptionKeyFromAsyncStorage } from "../lib/encryptionKey";

/**
 * Hook to sync legacy encryption key from AsyncStorage to the database.
 *
 * This is only used for migrating legacy v1 users to v2.
 * New users will not have a legacy encryption key in AsyncStorage.
 *
 * @returns Object with syncEncryptionKey function and loading state
 */
export const useLegacyEncryptionKeySync = () => {
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Syncs the legacy encryption key to the database with the user's legacy email.
     * This should only be called when the user explicitly initiates migration.
     *
     * @param legacyEmail - The email address from the user's legacy v1 account
     * @returns Promise that resolves when sync is complete
     */
    const syncEncryptionKey = useCallback(async (legacyEmail: string) => {
        setIsLoading(true);
        try {
            // Get the encryption key from AsyncStorage (will be empty string if not found)
            const encryptionKey =
                await getLegacyEncryptionKeyFromAsyncStorage();

            if (!encryptionKey) {
                throw new Error(
                    "No legacy encryption key found in AsyncStorage. This account may not have legacy data to migrate.",
                );
            }

            // Check if the encryption key already exists in the database
            const existingKeys = await getAllEncryptionLegacyKeys();

            if (existingKeys && existingKeys.length > 0) {
                // Key already exists, no need to insert again
                GlobalErrorHandler.logDebug(
                    "Legacy encryption key already exists in database",
                    "useLegacyEncryptionKeySync.syncEncryptionKey",
                    { hasLegacyEmail: !!legacyEmail },
                );
                return;
            }

            // Insert the encryption key into the database with the legacy email
            const result = await insertEncryptionKey({
                encryption_key: encryptionKey,
                legacy_email: legacyEmail,
            });

            if (!result) {
                throw new Error("Failed to insert encryption key to database");
            }

            GlobalErrorHandler.logDebug(
                "Legacy encryption key synced to database successfully",
                "useLegacyEncryptionKeySync.syncEncryptionKey",
                { legacyEmail },
            );
        } catch (error) {
            GlobalErrorHandler.logError(
                error,
                "useLegacyEncryptionKeySync.syncEncryptionKey",
                { operation: "sync_encryption_key", legacyEmail },
            );
            throw error; // Re-throw to let the caller handle the error
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        syncEncryptionKey,
        isLoading,
    };
};
