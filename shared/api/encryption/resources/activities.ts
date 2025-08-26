import type { Activity } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { decryptString, encryptString } from "../core";

/**
 * Encrypts the name field of an activity
 * @param activity - The activity object to encrypt
 * @returns Promise<Activity> - The activity with encrypted name
 */
export async function encryptActivityName(
  activity: Activity
): Promise<Activity> {
  if (!activity.name) {
    return activity;
  }

  try {
    const encryptedName = await encryptString(activity.name);
    return {
      ...activity,
      name: encryptedName,
    };
  } catch (error) {
    // If encryption fails, return original activity
    GlobalErrorHandler.logError(error, "ENCRYPTION_ACTIVITY_NAME", {
      activityId: activity.id,
      operation: "encrypt",
      fallbackBehavior: "return_original",
    });
    return activity;
  }
}

/**
 * Decrypts the name field of an activity
 * @param activity - The activity object to decrypt
 * @returns Promise<Activity> - The activity with decrypted name
 */
export async function decryptActivityName(
  activity: Activity
): Promise<Activity> {
  if (!activity.name) {
    return activity;
  }

  try {
    const decryptedName = await decryptString(activity.name);
    return {
      ...activity,
      name: decryptedName,
    };
  } catch (error) {
    // If decryption fails, return original activity
    GlobalErrorHandler.logError(error, "DECRYPTION_ACTIVITY_NAME", {
      activityId: activity.id,
      operation: "decrypt",
      fallbackBehavior: "return_original",
    });
    return activity;
  }
}

/**
 * Encrypts the name field of multiple activities
 * @param activities - Array of activity objects to encrypt
 * @returns Promise<Activity[]> - Array of activities with encrypted names
 */
export async function encryptActivitiesNames(
  activities: Activity[]
): Promise<Activity[]> {
  return Promise.all(activities.map(encryptActivityName));
}

/**
 * Decrypts the name field of multiple activities
 * @param activities - Array of activity objects to decrypt
 * @returns Promise<Activity[]> - Array of activities with decrypted names
 */
export async function decryptActivitiesNames(
  activities: Activity[]
): Promise<Activity[]> {
  return Promise.all(activities.map(decryptActivityName));
}

/**
 * Encrypts an activity for insertion (name field only)
 * @param activity - The activity object to encrypt for insertion
 * @returns Promise<Omit<Activity, "id">> - The activity ready for insertion with encrypted name
 */
export async function encryptActivityForInsertion(
  activity: Omit<Activity, "id">
): Promise<Omit<Activity, "id">> {
  if (!activity.name) {
    return activity;
  }

  try {
    const encryptedName = await encryptString(activity.name);
    return {
      ...activity,
      name: encryptedName,
    };
  } catch (error) {
    GlobalErrorHandler.logError(error, "ENCRYPTION_ACTIVITY_INSERTION", {
      operation: "encrypt_for_insertion",
      fallbackBehavior: "return_original",
    });
    return activity;
  }
}

/**
 * Encrypts multiple activities for insertion (name field only)
 * @param activities - Array of activity objects to encrypt for insertion
 * @returns Promise<Omit<Activity, "id">[]> - Array of activities ready for insertion with encrypted names
 */
export async function encryptActivitiesForInsertion(
  activities: Omit<Activity, "id">[]
): Promise<Omit<Activity, "id">[]> {
  return Promise.all(activities.map(encryptActivityForInsertion));
}
