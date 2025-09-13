import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

export type ProfileSyncResult = {
  success: boolean;
  updatedFields?: string[];
};

/**
 * Minimal placeholder for future profile sync with Clerk/Supabase.
 */
export class ProfileSyncService {
  static async syncFromAuth(): Promise<ProfileSyncResult> {
    try {
      // TODO: integrate with Clerk user data and persist to store/backend
      return { success: true, updatedFields: [] };
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_SYNC_FROM_AUTH_FAILED", {});
      return { success: false };
    }
  }

  static async uploadAvatar(_fileOrUrl: string): Promise<ProfileSyncResult> {
    try {
      // TODO: when storage pipeline is in place
      return { success: true };
    } catch (error) {
      GlobalErrorHandler.logError(error, "PROFILE_AVATAR_UPLOAD_FAILED", {});
      return { success: false };
    }
  }
}

