import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageResult } from "./types";

/**
 * Base storage utility class for AsyncStorage operations
 * Provides common patterns for error handling and logging
 */
export class BaseStorage {
  protected readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  /**
   * Generate a namespaced key for storage
   */
  protected getKey(key: string): string {
    return `${this.namespace}_${key}`;
  }

  /**
   * Generic get operation with error handling
   */
  protected async get<T>(
    key: string,
    defaultValue: T
  ): Promise<StorageResult<T>> {
    const namespacedKey = this.getKey(key);

    try {
      const stored = await AsyncStorage.getItem(namespacedKey);

      if (stored !== null) {
        const data = JSON.parse(stored) as T;

        GlobalErrorHandler.logDebug(
          `Storage retrieved: ${namespacedKey}`,
          "STORAGE_GET",
          { key: namespacedKey, hasData: true }
        );

        return { success: true, data };
      }

      GlobalErrorHandler.logDebug(
        `Storage key not found, using default: ${namespacedKey}`,
        "STORAGE_GET",
        { key: namespacedKey, hasData: false }
      );

      return { success: true, data: defaultValue };
    } catch (error) {
      GlobalErrorHandler.logError(error, "STORAGE_GET_ERROR", {
        key: namespacedKey,
        operation: "get",
      });

      return {
        success: false,
        data: defaultValue,
        error: error instanceof Error ? error.message : "Unknown storage error",
      };
    }
  }

  /**
   * Generic set operation with error handling
   */
  protected async set<T>(key: string, data: T): Promise<StorageResult<T>> {
    const namespacedKey = this.getKey(key);

    try {
      await AsyncStorage.setItem(namespacedKey, JSON.stringify(data));

      GlobalErrorHandler.logDebug(
        `Storage saved: ${namespacedKey}`,
        "STORAGE_SET",
        { key: namespacedKey, dataType: typeof data }
      );

      return { success: true, data };
    } catch (error) {
      GlobalErrorHandler.logError(error, "STORAGE_SET_ERROR", {
        key: namespacedKey,
        operation: "set",
        dataType: typeof data,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown storage error",
      };
    }
  }

  /**
   * Generic remove operation with error handling
   */
  protected async remove(key: string): Promise<StorageResult<void>> {
    const namespacedKey = this.getKey(key);

    try {
      await AsyncStorage.removeItem(namespacedKey);

      GlobalErrorHandler.logDebug(
        `Storage removed: ${namespacedKey}`,
        "STORAGE_REMOVE",
        { key: namespacedKey }
      );

      return { success: true };
    } catch (error) {
      GlobalErrorHandler.logError(error, "STORAGE_REMOVE_ERROR", {
        key: namespacedKey,
        operation: "remove",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown storage error",
      };
    }
  }

  /**
   * Generic clear operation for namespace
   */
  protected async clear(): Promise<StorageResult<void>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const namespacedKeys = keys.filter((key) =>
        key.startsWith(`${this.namespace}_`)
      );

      if (namespacedKeys.length > 0) {
        await AsyncStorage.multiRemove(namespacedKeys);

        GlobalErrorHandler.logDebug(
          `Storage namespace cleared: ${this.namespace}`,
          "STORAGE_CLEAR",
          { namespace: this.namespace, keysRemoved: namespacedKeys.length }
        );
      }

      return { success: true };
    } catch (error) {
      GlobalErrorHandler.logError(error, "STORAGE_CLEAR_ERROR", {
        namespace: this.namespace,
        operation: "clear",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown storage error",
      };
    }
  }
}
