// Tests for encryption utilities
import {
  decryptString,
  EncryptionError,
  encryptString,
  getEncryptionKey,
  hasEncryptionKey,
} from "@/shared/api/encryption/core";
import {
  decryptActivitiesNames,
  decryptActivityName,
  encryptActivitiesNames,
  encryptActivityName,
} from "@/shared/api/encryption/resources/activities";
import {
  decryptNoteMessage,
  decryptNotesMessages,
  encryptNoteMessage,
  encryptNotesMessages,
} from "@/shared/api/encryption/resources/notes";

// Mock expo-secure-store for testing
jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe("Encryption Utils", () => {
  const testKey = "test-encryption-key-12345678901234567890123456789012";

  beforeEach(() => {
    // Don't clear all mocks - we need the key to persist
    require("expo-secure-store").setItemAsync.mockClear();
    require("expo-secure-store").deleteItemAsync.mockClear();
    // Always return our test key
    require("expo-secure-store").getItemAsync.mockResolvedValue(testKey);
  });

  // Test basic string encryption
  describe("Basic string encryption", () => {
    test("should encrypt a string successfully", async () => {
      const originalText = "Hello, World!";
      const encrypted = await encryptString(originalText);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalText);
    });
  });

  // Test basic string decryption
  describe("Basic string decryption", () => {
    test("should decrypt a string successfully", async () => {
      const originalText = "Hello, World!";
      const encrypted = await encryptString(originalText);
      const decrypted = await decryptString(encrypted);
      expect(decrypted).toBe(originalText);
    });
  });

  // Test basic string encryption/decryption
  describe("Basic string encryption/decryption", () => {
    test("should encrypt and decrypt a string successfully", async () => {
      const originalText = "Hello, World!";

      const encrypted = await encryptString(originalText);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(originalText);

      const decrypted = await decryptString(encrypted);
      expect(decrypted).toBe(originalText);
    });

    test("should handle empty strings", async () => {
      const result = await encryptString("");
      expect(result).toBe("");
    });

    test("should handle null values", async () => {
      const result = await encryptString(null as any);
      expect(result).toBe(null);
    });
  });

  describe("Activity encryption", () => {
    test("should encrypt and decrypt activity name", async () => {
      const activity = {
        id: "123",
        name: "Reading Books",
        user_id: "user-123",
        status: "ENABLED" as const,
        activity_category_id: null,
        color: null,
        parent_activity_id: null,
        weight: null,
      };

      const encrypted = await encryptActivityName(activity);
      expect(encrypted.name).not.toBe(activity.name);
      expect(encrypted.id).toBe(activity.id); // Other fields unchanged

      const decrypted = await decryptActivityName(encrypted);
      expect(decrypted.name).toBe(activity.name);
      expect(decrypted.id).toBe(activity.id);
    });

    test("should handle activity with null name", async () => {
      const activity = {
        id: "123",
        name: null,
        user_id: "user-123",
        status: "ENABLED" as const,
        activity_category_id: null,
        color: null,
        parent_activity_id: null,
        weight: null,
      };

      const result = await encryptActivityName(activity);
      expect(result).toEqual(activity);
    });
  });

  describe("Note encryption", () => {
    test("should encrypt and decrypt note message", async () => {
      const note = {
        id: "456",
        message: "This is a private note with sensitive information",
        user_id: "user-123",
        timeslice_id: "timeslice-789",
      };

      const encrypted = await encryptNoteMessage(note);
      expect(encrypted.message).not.toBe(note.message);
      expect(encrypted.id).toBe(note.id); // Other fields unchanged

      const decrypted = await decryptNoteMessage(encrypted);
      expect(decrypted.message).toBe(note.message);
      expect(decrypted.id).toBe(note.id);
    });

    test("should handle note with null message", async () => {
      const note = {
        id: "456",
        message: null,
        user_id: "user-123",
        timeslice_id: "timeslice-789",
      };

      const result = await encryptNoteMessage(note);
      expect(result).toEqual(note);
    });
  });

  describe("Array encryption", () => {
    test("should encrypt and decrypt arrays of activities", async () => {
      const activities = [
        {
          id: "1",
          name: "Reading activity - " + Math.random(),
          user_id: "user-1",
          status: "ENABLED" as const,
          activity_category_id: null,
          color: null,
          parent_activity_id: null,
          weight: null,
        },
        {
          id: "2",
          name: "Writing activity - " + Math.random(),
          user_id: "user-1",
          status: "ENABLED" as const,
          activity_category_id: null,
          color: null,
          parent_activity_id: null,
          weight: null,
        },
        {
          id: "3",
          name: null,
          user_id: "user-1",
          status: "ENABLED" as const,
          activity_category_id: null,
          color: null,
          parent_activity_id: null,
          weight: null,
        }, // Test null handling
      ];

      const encrypted = await encryptActivitiesNames(activities);
      expect(encrypted[0].name).not.toBe(activities[0].name);
      expect(encrypted[1].name).not.toBe(activities[1].name);
      expect(encrypted[2].name).toBe(activities[2].name); // null should remain null

      const decrypted = await decryptActivitiesNames(encrypted);
      expect(decrypted).toEqual(activities);
    });

    test("should encrypt and decrypt arrays of notes", async () => {
      const notes = [
        {
          id: "1",
          message: "Unique secret note message 1 - " + Math.random(),
          user_id: "user-1",
          timeslice_id: "timeslice-1",
        },
        {
          id: "2",
          message: "Unique secret note message 2 - " + Math.random(),
          user_id: "user-1",
          timeslice_id: "timeslice-2",
        },
      ];

      const encrypted = await encryptNotesMessages(notes);
      expect(encrypted[0].message).not.toBe(notes[0].message);
      expect(encrypted[1].message).not.toBe(notes[1].message);

      const decrypted = await decryptNotesMessages(encrypted);
      expect(decrypted).toEqual(notes);
    });
  });

  describe("Key management", () => {
    test("should check if encryption key exists", async () => {
      require("expo-secure-store").getItemAsync.mockResolvedValue("some-key");
      const exists = await hasEncryptionKey();
      expect(exists).toBe(true);

      require("expo-secure-store").getItemAsync.mockResolvedValue(null);
      const notExists = await hasEncryptionKey();
      expect(notExists).toBe(false);
    });

    test("should get encryption key", async () => {
      const key = await getEncryptionKey();
      expect(key).toBeDefined();
      expect(typeof key).toBe("string");
    });
  });

  describe("Error handling", () => {
    test("should throw EncryptionError on SecureStore failure", async () => {
      require("expo-secure-store").getItemAsync.mockRejectedValue(
        new Error("SecureStore error")
      );

      await expect(encryptString("test")).rejects.toThrow(EncryptionError);
    });

    test("should throw EncryptionError with context", async () => {
      require("expo-secure-store").getItemAsync.mockRejectedValue(
        new Error("Access denied")
      );

      try {
        await encryptString("test");
      } catch (error) {
        expect(error).toBeInstanceOf(EncryptionError);
        expect((error as EncryptionError).message).toContain("[Encryption]");
      }
    });
  });
});
