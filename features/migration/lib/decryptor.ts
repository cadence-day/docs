import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY_STORAGE_KEY = "@cadence_encryption_key";
const UNABLE_TO_DECRYPT_MESSAGE = "[UNABLE_TO_DECRYPT]";

/**
 * Get encryption key from AsyncStorage
 * @returns The encryption key or null if not found
 */
export async function getEncryptionKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to retrieve encryption key:", error);
    return null;
  }
}

/**
 * Check if an encryption key is available
 * @returns Boolean indicating if a key is available
 */
export async function hasEncryptionKey(): Promise<boolean> {
  const key = await getEncryptionKey();
  return key !== null && key.length > 0;
}

/**
 * Check if a message appears to be encrypted
 * This is a heuristic check looking for typical encrypted data patterns
 * @param message - The message to check
 * @returns Boolean indicating if the message appears to be encrypted
 */
export function isMessageEncrypted(message: string): boolean {
  if (!message || message.length === 0) return false;

  // Check for common encrypted data indicators:
  // - Base64-like patterns
  // - No readable words
  // - High entropy
  // - Specific prefixes/patterns from common encryption libraries

  // Basic heuristics
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  const hasOnlyBase64Chars = base64Pattern.test(message.replace(/\s/g, ""));

  // Check for CryptoJS encrypted format (typically starts with "U2FsdGVkX1")
  const isCryptoJSEncrypted = message.startsWith("U2FsdGVkX1");

  // Check for high entropy (encrypted data usually has high entropy)
  const entropy = calculateEntropy(message);
  const hasHighEntropy = entropy > 4.5; // Typical threshold for encrypted data

  // Check if it looks like readable text (has spaces, common letters)
  const hasReadableChars = /[a-zA-Z\s]/.test(message) && message.includes(" ");
  const isLikelyReadable = hasReadableChars && entropy < 4.0;

  return (
    (hasOnlyBase64Chars && message.length > 20) ||
    isCryptoJSEncrypted ||
    (hasHighEntropy && !isLikelyReadable)
  );
}

/**
 * Calculate Shannon entropy of a string
 * @param str - The string to analyze
 * @returns The entropy value
 */
function calculateEntropy(str: string): number {
  const frequencies = new Map<string, number>();

  // Count character frequencies
  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  // Calculate entropy
  let entropy = 0;
  const length = str.length;

  for (const count of frequencies.values()) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

/**
 * Attempt to decrypt a message using the stored encryption key
 * @param encryptedMessage - The encrypted message to decrypt
 * @param key - Optional encryption key (will use stored key if not provided)
 * @returns The decrypted message or null if decryption failed
 */
export async function decryptMessage(
  encryptedMessage: string,
  key?: string
): Promise<string | null> {
  try {
    const encryptionKey = key || (await getEncryptionKey());

    if (!encryptionKey) {
      console.warn("No encryption key available for decryption");
      return null;
    }

    // Try different decryption methods based on common patterns

    // Method 1: CryptoJS AES decryption (common format)
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (decryptedText && decryptedText.length > 0) {
        return decryptedText;
      }
    } catch (error) {
      // Try next method
    }

    // Method 2: Base64 decode then AES decrypt
    try {
      const base64Decoded = CryptoJS.enc.Base64.parse(encryptedMessage);
      const decryptedBytes = CryptoJS.AES.decrypt(
        { ciphertext: base64Decoded } as any,
        encryptionKey
      );
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (decryptedText && decryptedText.length > 0) {
        return decryptedText;
      }
    } catch (error) {
      // Try next method
    }

    // Method 3: Try with different encoding
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(
        encryptedMessage,
        CryptoJS.enc.Utf8.parse(encryptionKey),
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }
      );
      const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (decryptedText && decryptedText.length > 0) {
        return decryptedText;
      }
    } catch (error) {
      // All methods failed
    }

    console.warn("All decryption methods failed for message");
    return null;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

/**
 * Process a note message for migration
 * This function handles both encrypted and plaintext messages
 * @param message - The original message from the database
 * @param key - Optional encryption key
 * @returns Object with processed message and metadata
 */
export async function processNoteForMigration(
  message: string,
  key?: string
): Promise<{
  message: string;
  wasEncrypted: boolean;
  decryptionSuccessful: boolean;
  originalMessage: string;
}> {
  const originalMessage = message;

  if (!isMessageEncrypted(message)) {
    // Message is plaintext, migrate as-is
    return {
      message,
      wasEncrypted: false,
      decryptionSuccessful: true,
      originalMessage,
    };
  }

  // Message appears to be encrypted
  const decryptedMessage = await decryptMessage(message, key);

  if (decryptedMessage) {
    // Successfully decrypted
    return {
      message: decryptedMessage,
      wasEncrypted: true,
      decryptionSuccessful: true,
      originalMessage,
    };
  } else {
    // Failed to decrypt
    return {
      message: UNABLE_TO_DECRYPT_MESSAGE,
      wasEncrypted: true,
      decryptionSuccessful: false,
      originalMessage,
    };
  }
}

/**
 * Batch process multiple notes for migration
 * @param messages - Array of message strings
 * @param key - Optional encryption key
 * @returns Array of processed note objects
 */
export async function batchProcessNotesForMigration(
  messages: string[],
  key?: string
): Promise<Array<{
  message: string;
  wasEncrypted: boolean;
  decryptionSuccessful: boolean;
  originalMessage: string;
}>> {
  const results = [];

  for (const message of messages) {
    const processed = await processNoteForMigration(message, key);
    results.push(processed);
  }

  return results;
}

/**
 * Get decryption statistics for a set of processed notes
 * @param processedNotes - Array of processed note objects
 * @returns Statistics about decryption success
 */
export function getDecryptionStats(processedNotes: Array<{
  wasEncrypted: boolean;
  decryptionSuccessful: boolean;
}>): {
  total: number;
  encrypted: number;
  decrypted: number;
  failed: number;
  successRate: number;
} {
  const total = processedNotes.length;
  const encrypted = processedNotes.filter(note => note.wasEncrypted).length;
  const decrypted = processedNotes.filter(
    note => note.wasEncrypted && note.decryptionSuccessful
  ).length;
  const failed = encrypted - decrypted;
  const successRate = encrypted > 0 ? (decrypted / encrypted) * 100 : 100;

  return {
    total,
    encrypted,
    decrypted,
    failed,
    successRate,
  };
}