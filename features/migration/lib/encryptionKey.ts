import AsyncStorage from "@react-native-async-storage/async-storage";

const ENCRYPTION_KEY_STORAGE_KEY = "@cadence_encryption_key";

/**
 * Generate a random encryption key if one doesn't exist in AsyncStorage.
 * This is the legacy encryption key used in System 1 (v1).
 *
 * @returns Promise<string> - The encryption key (existing or newly generated)
 * @throws Error if unable to access AsyncStorage
 */
export const getLegacyEncryptionKeyFromAsyncStorage = async (): Promise<
    string
> => {
    try {
        const key = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
        // If key exists, return it; otherwise return empty string
        return key || "";
    } catch (error) {
        throw error;
    }
};
