import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

import {
    getAllActivities,
    getUserNotes,
    updateActivities,
    updateNotes,
} from "../resources";

// Constants for encryption
const ENCRYPTION_KEY_NAME = "cadence_app_encryption_key";
const KEY_SIZE = 256; // AES-256
const ALGORITHM = "AES";
const IV_BYTES = 16; // AES block size in bytes (128 bits)

/**
 * Error class for encryption-related operations
 */
export class EncryptionError extends Error {
    constructor(message: string, public originalError?: any) {
        super(`[Encryption] ${message}`);
        this.name = "EncryptionError";
    }
}

/**
 * Generate a new encryption key and store it securely
 * @returns Promise<string> The generated encryption key
 */
async function generateAndStoreKey(): Promise<string> {
    try {
        // Generate a random 256-bit key
        const key = CryptoJS.lib.WordArray.random(KEY_SIZE / 8).toString();

        // Store the key securely
        await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);

        return key;
    } catch (error) {
        throw new EncryptionError(
            "Failed to generate and store encryption key",
            error,
        );
    }
}

/**
 * Get the encryption key from secure storage, generate one if it doesn't exist
 * @returns Promise<string> The encryption key
 */
export async function getEncryptionKey(): Promise<string> {
    try {
        // Try to get existing key
        let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

        // If no key exists, generate a new one
        if (!key) {
            key = await generateAndStoreKey();
        }

        return key;
    } catch (error) {
        throw new EncryptionError("Failed to retrieve encryption key", error);
    }
}

/**
 * Encrypt a string value
 * @param plaintext The string to encrypt
 * @returns Promise<string> The encrypted string
 */
export async function encryptString(plaintext: string): Promise<string> {
    if (!plaintext || typeof plaintext !== "string") {
        return plaintext; // Return as-is if invalid input
    }

    // Check if already encrypted by attempting to decrypt it
    // If it can be decrypted successfully, it's already encrypted
    try {
        await decryptString(plaintext);
        return plaintext; // Already encrypted
    } catch {
        // Not encrypted, continue to encrypt
    }

    try {
        const key = await getEncryptionKey();

        // Encrypt using CryptoJS built-in format (includes salt and IV)
        const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        // Return as string (CryptoJS handles the format automatically)
        return encrypted.toString();
    } catch (error) {
        throw new EncryptionError("Failed to encrypt string", error);
    }
}

/**
 * Decrypt a string value
 * @param encryptedData The encrypted string
 * @returns Promise<string> The decrypted string
 */
export async function decryptString(encryptedData: string): Promise<string> {
    if (!encryptedData || typeof encryptedData !== "string") {
        return encryptedData; // Return as-is if invalid input
    }

    try {
        const key = await getEncryptionKey();

        // Decrypt using CryptoJS built-in format (handles salt and IV automatically)
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        // Convert to UTF-8 string
        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
        if (!plaintext) {
            throw new Error("Decryption resulted in empty string");
        }
        return plaintext;
    } catch (error) {
        throw new EncryptionError("Failed to decrypt string", error);
    }
}

/**
 * Clear the stored encryption key (useful for logout or key rotation)
 * @returns Promise<void>
 */

export async function clearEncryptionKey(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
    } catch (error) {
        throw new EncryptionError("Failed to clear encryption key", error);
    }
}

/**
 * Rotate the encryption key (generates a new key and clears the old one)
 * WARNING: This will make all previously encrypted data unreadable
 * @returns Promise<string> The new encryption key
 */
async function rotateEncryptionKey(): Promise<string> {
    try {
        await clearEncryptionKey();
        return await generateAndStoreKey();
    } catch (error) {
        throw new EncryptionError("Failed to rotate encryption key", error);
    }
}

/**
 * Check if encryption key exists
 * @returns Promise<boolean> True if key exists, false otherwise
 */
export async function hasEncryptionKey(): Promise<boolean> {
    try {
        const key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
        return !!key;
    } catch (error) {
        return false;
    }
}

/**
 * Rotate the encryption key and re-encrypt all sensitive data.
 * Get all the data that needs to be re-encrypted (Activities and Notes) and re-encrypt them with the new key.
 * @userId The ID of the user whose data is being re-encrypted
 * @returns Promise<void>
 */
export async function rotateEncryptionKeyAndReEncryptData(
    userId: string,
): Promise<void> {
    try {
        // Step 1: Fetch all existing data that needs to be re-encrypted
        const activities = await getAllActivities();
        const notes = await getUserNotes(userId);

        // Step 2: Decryption is already handled at the client-side

        // Step 3: Rotate the encryption key
        await rotateEncryptionKey();

        // Step 4: Re-encrypt all data using the update functions which handle encryption with the new key
        await Promise.all([
            updateActivities(activities),
            updateNotes(notes),
        ]);
    } catch (error) {
        console.error(
            "Failed to rotate encryption key and re-encrypt data:",
            error,
        );
        throw new EncryptionError(
            "Failed to rotate encryption key and re-encrypt data",
            error,
        );
    }
}
