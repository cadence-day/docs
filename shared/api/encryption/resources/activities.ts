import { decryptString, encryptString } from "../core";
import type { Activity } from "@/shared/types/models";

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
    console.error("Failed to encrypt activity name:", error);
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
    console.error("Failed to decrypt activity name:", error);
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
    console.error("Failed to encrypt activity name for insertion:", error);
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
