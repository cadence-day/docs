import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Constants for encryption
const ENCRYPTION_KEY_NAME = "cadence_app_encryption_key";
const KEY_SIZE = 256; // AES-256
const ALGORITHM = "AES";
const IV_BYTES = 16; // AES block size in bytes (128 bits)
const ENCRYPTED_PREFIX = "enc:"; // Prefix to identify encrypted strings

// Export the prefix for external use if needed
export { ENCRYPTED_PREFIX };

/**
 * Simple XOR encryption with base64 encoding
 * @param text Text to encrypt
 * @param key Encryption key (hex string)
 * @returns Base64 encoded encrypted text
 */
function xorEncrypt(text: string, key: string): string {
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new Uint8Array(
    key.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const encrypted = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  // Convert to base64
  return btoa(String.fromCharCode(...encrypted));
}

/**
 * Simple XOR decryption from base64
 * @param encryptedBase64 Base64 encoded encrypted text
 * @param key Encryption key (hex string)
 * @returns Decrypted text
 */
function xorDecrypt(encryptedBase64: string, key: string): string {
  // Convert from base64
  const encrypted = new Uint8Array(
    atob(encryptedBase64)
      .split("")
      .map((char) => char.charCodeAt(0))
  );

  const keyBytes = new Uint8Array(
    key.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const decrypted = new Uint8Array(encrypted.length);
  for (let i = 0; i < encrypted.length; i++) {
    decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
  }

  return new TextDecoder().decode(decrypted);
}

/**
 * Generate a pseudo-random string when native crypto is not available
 * This is not cryptographically secure but better than nothing for fallback
 */
function generateFallbackRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a secure random key using expo-crypto with fallback
 */
async function generateRandomKey(): Promise<string> {
  try {
    // Generate 32 bytes (256 bits) for AES-256 key
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    // Convert to hex string
    return Array.from(randomBytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    GlobalErrorHandler.logWarning(
      "Expo crypto random failed, using fallback generator",
      "encryption.generateRandomKey",
      { error }
    );
    // Fallback to pseudo-random generation when native crypto is unavailable
    return generateFallbackRandomString(64); // 64 chars = 256 bits in hex
  }
}

/**
 * Error class for encryption-related operations
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
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
    const key = await generateRandomKey();

    // Store the key securely
    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);

    return key;
  } catch (error) {
    // If SecureStore fails, log and return an ephemeral key. We intentionally
    // removed AsyncStorage persistence to avoid storing sensitive keys in
    // less-secure storage.
    GlobalErrorHandler.logError(error, "ENCRYPTION_SECURESTORE_FAILED", {
      operation: "generate_and_store",
    });

    // Return an ephemeral key (won't be persisted) so the caller can still
    // proceed for the current session if appropriate.
    return await generateRandomKey();
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

    // If no key found, generate one and attempt to persist to SecureStore.
    if (!key) {
      key = await generateAndStoreKey();
    }

    return key;
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_GET_KEY_FAILED", {});
    // As a last resort, return an ephemeral key
    return await generateRandomKey();
  }
}

/**
 * Get the encryption key and the source where it was retrieved from.
 * Source can be 'securestore', 'asyncstorage', or 'ephemeral'.
 */
export async function getEncryptionKeyWithSource(): Promise<{
  key: string;
  source: "securestore" | "asyncstorage" | "ephemeral";
}> {
  try {
    const secureKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (secureKey) return { key: secureKey, source: "securestore" };

    // No key stored yet; generate and persist using SecureStore path. If
    // persistence fails, generateAndStoreKey will return an ephemeral key.
    const generated = await generateAndStoreKey();

    // Check SecureStore again to see if persistence succeeded.
    const checkSecure = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (checkSecure) return { key: checkSecure, source: "securestore" };

    // Return ephemeral
    return { key: generated, source: "ephemeral" };
  } catch (error) {
    // On any error, try AsyncStorage then return ephemeral
    GlobalErrorHandler.logError(
      error,
      "ENCRYPTION_GET_KEY_WITH_SOURCE_FAILED",
      {}
    );
    const ephemeral = await generateRandomKey();
    return { key: ephemeral, source: "ephemeral" };
  }
}

/**
 * Encrypt a string value
 * @param plaintext The string to encrypt
 * @returns Promise<string> The encrypted string
 */
/**
 * Encrypt a string value with fallback to return original on complete failure
 * @param plaintext The string to encrypt
 * @param allowFallback If true, returns original text when encryption fails completely
 * @returns Promise<string> The encrypted string or original if fallback enabled
 */
export async function encryptString(
  plaintext: string,
  allowFallback: boolean = false
): Promise<string> {
  if (!plaintext || typeof plaintext !== "string") {
    return plaintext; // Return as-is if invalid input
  }

  // Check if already encrypted by prefix
  if (plaintext.startsWith(ENCRYPTED_PREFIX)) {
    return plaintext; // Already encrypted
  }

  try {
    const keyHex = await getEncryptionKey();
    GlobalErrorHandler.logDebug(
      "Got encryption key for encrypt",
      "encryption.encryptString",
      {
        length: keyHex?.length,
      }
    );

    // Use simple XOR encryption with base64 encoding
    const encrypted = xorEncrypt(plaintext, keyHex);
    return ENCRYPTED_PREFIX + encrypted;
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_ENCRYPT_FAILED", {
      plaintextLength: plaintext?.length,
      plaintextSample: plaintext?.substring(0, 20),
    });

    if (allowFallback) {
      GlobalErrorHandler.logWarning(
        "Encryption fallback: returning plaintext due to error",
        "encryption.encryptString",
        {}
      );
      return plaintext;
    }

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

  // Check if the string has the encrypted prefix
  if (!encryptedData.startsWith(ENCRYPTED_PREFIX)) {
    return encryptedData; // Not encrypted, return as-is
  }

  try {
    const keyHex = await getEncryptionKey();

    // Remove the prefix before decrypting
    const encryptedDataWithoutPrefix = encryptedData.substring(
      ENCRYPTED_PREFIX.length
    );

    // Use simple XOR decryption
    const plaintext = xorDecrypt(encryptedDataWithoutPrefix, keyHex);
    if (!plaintext) {
      throw new Error("Decryption resulted in empty string");
    }

    return plaintext;
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_DECRYPT_FAILED", {});
    throw new EncryptionError("Failed to decrypt string", error);
  }
}

/**
 * Clear the stored encryption key (useful for logout or key rotation)
 * @returns Promise<void>
 * @private Internal function - use rotateEncryptionKeyAndReEncryptData for safe key rotation
 */
async function _clearEncryptionKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_CLEAR_KEY_FAILED", {});
    throw new EncryptionError("Failed to clear encryption key", error);
  }
}

/**
 * Public helper to clear the encryption key from all storage backends
 */
export async function clearEncryptionKey(): Promise<void> {
  try {
    // attempt SecureStore deletion first
    try {
      await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
    } catch (secureErr) {
      // log and continue to try AsyncStorage
      GlobalErrorHandler.logError(
        secureErr,
        "ENCRYPTION_CLEAR_SECURESTORE_FAILED",
        {}
      );
    }
    // We purposely removed AsyncStorage cleanup — the key should only be in SecureStore.
  } catch (err) {
    throw new EncryptionError("Failed to clear encryption key", err);
  }
}

/**
 * Rotate the encryption key (generates a new key and clears the old one)
 * WARNING: This will make all previously encrypted data unreadable
 * @returns Promise<string> The new encryption key
 * @private Internal function - use rotateEncryptionKeyAndReEncryptData for safe key rotation
 */
async function _rotateEncryptionKey(): Promise<string> {
  try {
    await _clearEncryptionKey();
    return await generateAndStoreKey();
  } catch (error) {
    throw new EncryptionError("Failed to rotate encryption key", error);
  }
}

/**
 * Check if a string is encrypted (has the encryption prefix)
 * @param value The string to check
 * @returns boolean True if the string is encrypted, false otherwise
 */
export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX);
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
 * WARNING: DO NOT USE THIS FUNCTION BEFORE BATCHING IS IMPLEMENTED (It needs prior work in the shared/api/resources)
 * @userId The ID of the user whose data is being re-encrypted
 * @returns Promise<void>
 *
 * NOTE: This function is temporarily disabled to resolve circular dependencies.
 * To implement this, move the function to a higher-level service that can import
 * both the encryption utilities and the API resources.
 */
export async function rotateEncryptionKeyAndReEncryptData(
  userId: string
): Promise<void> {
  try {
    // Dynamic import to avoid circular dependency at module load time.
    // This file previously imported resource helpers at the top-level which
    // caused a require cycle: encryption/core -> resources -> encryption -> core.
    // Importing here delays the import until the function is called.
    const resources = await import("@/shared/api/resources");
    const { getAllActivities, getUserNotes, updateActivities, updateNotes } =
      resources;

    // Step 1: Fetch all existing data that needs to be re-encrypted
    const activities = await getAllActivities();
    const notes = await getUserNotes(userId);

    // Step 2: Decryption is already handled at the client-side

    // Step 3: Rotate the encryption key
    await _rotateEncryptionKey();

    // Step 4: Re-encrypt all data using the update functions which handle encryption with the new key
    await Promise.all([updateActivities(activities), updateNotes(notes)]);
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_KEY_ROTATION", {
      userId,
      operation: "rotate_key_and_reencrypt",
      step: "re_encrypt_all_data",
    });
    throw new EncryptionError(
      "Failed to rotate encryption key and re-encrypt data",
      error
    );
  }
}
