import { BaseStorage } from "@/shared/storage/base";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import * as CryptoJS from "crypto-js";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Constants for encryption
const ENCRYPTION_KEY_NAME = "cadence_app_encryption_key";
const ENCRYPTED_PREFIX = "enc:"; // Prefix to identify encrypted strings

// Storage for checking encryption state
class EncryptionCoreStorage extends BaseStorage {
  constructor() {
    super("encryption");
  }

  async getEncryptedDataDetected(): Promise<boolean> {
    const result = await this.get("encrypted_data_detected", false);
    return result.data || false;
  }

  async setEncryptedDataDetected(detected: boolean): Promise<void> {
    await this.set("encrypted_data_detected", detected);
  }
}

const encryptionStorage = new EncryptionCoreStorage();

// Global callback for encrypted data detection
let onEncryptedDataDetected: (() => void) | null = null;

// Global callback for encryption key changes
let onEncryptionKeyChanged: (() => Promise<void>) | null = null;

/**
 * Set a callback to be called when encrypted data is detected
 * This is used by the EncryptionProvider to be notified when encrypted data is found
 */
export function setEncryptedDataDetectedCallback(
  callback: (() => void) | null,
): void {
  onEncryptedDataDetected = callback;
}

/**
 * Set a callback to be called when encryption key changes
 * This is used by the EncryptionProvider to refresh stores when keys change
 */
export function setEncryptionKeyChangedCallback(
  callback: (() => Promise<void>) | null,
): void {
  onEncryptionKeyChanged = callback;
}

/**
 * Trigger the encrypted data detected callback
 * This should be called when encrypted data is found in the API responses
 */
export function triggerEncryptedDataDetected(): void {
  // Mark encrypted data as detected in storage
  encryptionStorage.setEncryptedDataDetected(true).catch((error) => {
    GlobalErrorHandler.logError(
      error,
      "ENCRYPTION_SET_DATA_DETECTED_FAILED",
      {},
    );
  });

  if (onEncryptedDataDetected) {
    try {
      onEncryptedDataDetected();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_DATA_DETECTED_CALLBACK_FAILED",
        {},
      );
    }
  }
}

/**
 * Trigger the encryption key changed callback
 * This should be called when encryption key is imported or changes
 */
export async function triggerEncryptionKeyChanged(): Promise<void> {
  if (onEncryptionKeyChanged) {
    try {
      await onEncryptionKeyChanged();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "ENCRYPTION_KEY_CHANGED_CALLBACK_FAILED",
        {},
      );
    }
  }
}

/**
 * Function to refresh all stores when encryption key changes
 * This is called automatically from the core when keys are imported or changed
 */
export async function refreshAllStoresFromCore(): Promise<void> {
  try {
    GlobalErrorHandler.logWarning(
      "Refreshing all stores due to encryption key change (from core)",
      "ENCRYPTION_CORE_STORE_REFRESH",
      {},
    );

    // Dynamic import to avoid circular dependencies
    const stores = await import("@/shared/stores/resources");

    // Get all store instances and call their refresh methods
    const storeRefreshPromises = [
      stores.useActivitiesStore.getState().refresh(),
      stores.useActivityCategoriesStore.getState().refresh(),
      // Note: For notes and other user-specific stores, we'll refresh them too
      // The stores should handle the case where user context isn't available
    ];

    await Promise.allSettled(storeRefreshPromises);

    GlobalErrorHandler.logWarning(
      "All stores refreshed successfully (from core)",
      "ENCRYPTION_CORE_STORE_REFRESH_COMPLETE",
      {},
    );

    // Also trigger the callback if set
    await triggerEncryptionKeyChanged();
  } catch (error) {
    GlobalErrorHandler.logError(
      error,
      "ENCRYPTION_CORE_STORE_REFRESH_FAILED",
      {},
    );
  }
}

/**
 * Simple XOR encryption with base64 encoding
 * @param text Text to encrypt
 * @param key Encryption key (hex string)
 * @returns Base64 encoded encrypted text
 */
function xorEncrypt(text: string, key: string): string {
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new Uint8Array(
    key.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
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
      .map((char) => char.charCodeAt(0)),
  );

  const keyBytes = new Uint8Array(
    key.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
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
      { error },
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
    public originalError?: any,
  ) {
    super(`[Encryption] ${message}`);
    this.name = "EncryptionError";
  }
}

/**
 * Create a short fingerprint of a key for display/logging (never log the key itself)
 * Uses SHA-256 and returns the first 8 hex characters by default.
 */
export function getKeyFingerprint(key: string, length: number = 8): string {
  try {
    if (!key) return "";
    const hash = CryptoJS.SHA256(key).toString(CryptoJS.enc.Hex);
    return hash.slice(0, Math.max(1, Math.min(length, hash.length)));
  } catch (error) {
    GlobalErrorHandler.logWarning(
      "Failed to compute key fingerprint",
      "encryption.getKeyFingerprint",
      {},
    );
    return "";
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

    // If no key found, check if encrypted data has been detected
    if (!key) {
      const encryptedDataDetected = await encryptionStorage
        .getEncryptedDataDetected();

      if (encryptedDataDetected) {
        // User has encrypted data but no key - don't generate a new key
        throw new EncryptionError(
          "Encrypted data detected but no encryption key found. Please import your encryption key to access your data.",
        );
      }

      // No encrypted data detected, safe to generate a new key
      key = await generateAndStoreKey();
    }

    return key;
  } catch (error) {
    // If this is our specific error about encrypted data detection, re-throw it
    if (
      error instanceof EncryptionError &&
      error.message.includes("Encrypted data detected")
    ) {
      throw error;
    }

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

    // Check if encrypted data has been detected
    const encryptedDataDetected = await encryptionStorage
      .getEncryptedDataDetected();

    if (encryptedDataDetected) {
      // User has encrypted data but no key - don't generate a new key
      // This prevents data loss by forcing the user to import their existing key
      throw new EncryptionError(
        "Encrypted data detected but no encryption key found. Please import your encryption key to access your data.",
      );
    }

    // No key stored yet and no encrypted data detected; generate and persist using SecureStore path.
    // If persistence fails, generateAndStoreKey will return an ephemeral key.
    const generated = await generateAndStoreKey();

    // Check SecureStore again to see if persistence succeeded.
    const checkSecure = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (checkSecure) return { key: checkSecure, source: "securestore" };

    // Return ephemeral
    return { key: generated, source: "ephemeral" };
  } catch (error) {
    // If this is our specific error about encrypted data detection, re-throw it
    if (
      error instanceof EncryptionError &&
      error.message.includes("Encrypted data detected")
    ) {
      throw error;
    }

    // On any other error, try AsyncStorage then return ephemeral
    GlobalErrorHandler.logError(
      error,
      "ENCRYPTION_GET_KEY_WITH_SOURCE_FAILED",
      {},
    );
    const ephemeral = await generateRandomKey();
    return { key: ephemeral, source: "ephemeral" };
  }
}

/**
 * Export the current encryption key for portability.
 * Never log or expose the key outside caller control. Returns key + fingerprint.
 */
export async function exportEncryptionKey(): Promise<{
  key: string;
  fingerprint: string;
  source: "securestore" | "ephemeral" | "asyncstorage";
}> {
  try {
    const { key, source } = await getEncryptionKeyWithSource();
    const fingerprint = getKeyFingerprint(key);
    return { key, fingerprint, source };
  } catch (error) {
    // If this is our specific error about encrypted data detection, provide a clearer message
    if (
      error instanceof EncryptionError &&
      error.message.includes("Encrypted data detected")
    ) {
      throw new EncryptionError(
        "Cannot export encryption key: No key available on this device. Please import your encryption key first.",
      );
    }
    throw error;
  }
}

/**
 * Import an encryption key (64 hex chars) and persist it.
 * Overwrites any existing key in SecureStore.
 */
export async function importEncryptionKey(key: string): Promise<{
  fingerprint: string;
}> {
  try {
    if (!key) throw new EncryptionError("Key is empty");
    const normalized = key.trim().toLowerCase();
    const isValid = /^[0-9a-f]{64}$/.test(normalized);
    if (!isValid) {
      throw new EncryptionError(
        "Invalid key format. Expected 64 hex characters",
      );
    }

    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, normalized);
    const fp = getKeyFingerprint(normalized);
    GlobalErrorHandler.logWarning(
      `Encryption key imported (fp=${fp})`,
      "encryption.importEncryptionKey",
      { fp },
    );

    // Automatically refresh all stores when a new key is imported
    await refreshAllStoresFromCore();

    return { fingerprint: fp };
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_IMPORT_KEY_FAILED", {});
    throw new EncryptionError("Failed to import encryption key", error);
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
  allowFallback: boolean = false,
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
      },
    );

    // Use simple XOR encryption with base64 encoding
    const encrypted = xorEncrypt(plaintext, keyHex);
    return ENCRYPTED_PREFIX + encrypted;
  } catch (error) {
    // If this is our specific error about encrypted data detection, handle it appropriately
    if (
      error instanceof EncryptionError &&
      error.message.includes("Encrypted data detected")
    ) {
      GlobalErrorHandler.logWarning(
        "Cannot encrypt new data: encryption key not available due to existing encrypted data",
        "ENCRYPTION_KEY_NOT_AVAILABLE_FOR_NEW_DATA",
        { plaintextLength: plaintext?.length },
      );

      if (allowFallback) {
        return plaintext; // Return plaintext when encryption not possible
      }

      // Re-throw the error to let the caller handle it
      throw error;
    }

    GlobalErrorHandler.logError(error, "ENCRYPTION_ENCRYPT_FAILED", {
      plaintextLength: plaintext?.length,
      plaintextSample: plaintext?.substring(0, 20),
    });

    if (allowFallback) {
      GlobalErrorHandler.logWarning(
        "Encryption fallback: returning plaintext due to error",
        "encryption.encryptString",
        {},
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

  // Trigger encrypted data detection callback
  triggerEncryptedDataDetected();

  try {
    const keyHex = await getEncryptionKey();

    // Remove the prefix before decrypting
    const encryptedDataWithoutPrefix = encryptedData.substring(
      ENCRYPTED_PREFIX.length,
    );

    // Use simple XOR decryption
    const plaintext = xorDecrypt(encryptedDataWithoutPrefix, keyHex);
    if (!plaintext) {
      throw new Error("Decryption resulted in empty string");
    }

    return plaintext;
  } catch (error) {
    // If this is our specific error about encrypted data detection, handle it gracefully
    if (
      error instanceof EncryptionError &&
      error.message.includes("Encrypted data detected")
    ) {
      GlobalErrorHandler.logWarning(
        "Cannot decrypt data: encryption key not available",
        "ENCRYPTION_KEY_NOT_AVAILABLE",
        { hasPrefix: encryptedData.startsWith(ENCRYPTED_PREFIX) },
      );
      // Return the encrypted data as-is with a visual indicator
      return `🔒 [Encrypted data - key required]`;
    }

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
        {},
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
 * Format encrypted text for display purposes
 * @param value The text to format
 * @param showAsStars Whether to show as stars (*) or truncated binary
 * @param isVisualizationMode Whether visualization mode is enabled
 * @returns The formatted text for display
 */
export function formatEncryptedText(
  value: string,
  showAsStars: boolean = true,
  isVisualizationMode: boolean = false,
): string {
  if (!isVisualizationMode || !isEncrypted(value)) {
    return value;
  }

  if (showAsStars) {
    // Show as asterisks - create a reasonable length based on content
    const baseLength = Math.min(Math.max(8, Math.floor(value.length / 4)), 20);
    return "*".repeat(baseLength);
  } else {
    // Show truncated encrypted content with prefix
    const encryptedContent = value.substring(ENCRYPTED_PREFIX.length);
    const truncated = encryptedContent.length > 16
      ? `${encryptedContent.substring(0, 16)}...`
      : encryptedContent;
    return `${ENCRYPTED_PREFIX}${truncated}`;
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
  } catch {
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
  userId: string,
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
      error,
    );
  }
}
