import { BaseStorage } from "@/shared/storage/base";
import { STORAGE_KEYS } from "@/shared/storage/types";

class UserVersionStorage extends BaseStorage {
    constructor() {
        // namespace by app name to avoid collisions
        super("cadence_user");
    }

    async getLastSeenVersion(): Promise<string | null> {
        const result = await this.get<string | null>(
            STORAGE_KEYS.USER_LAST_SEEN_VERSION,
            null,
        );
        return result.data ?? null;
    }

    async setLastSeenVersion(version: string): Promise<boolean> {
        const result = await this.set<string>(
            STORAGE_KEYS.USER_LAST_SEEN_VERSION,
            version,
        );
        return result.success;
    }

    async clearLastSeenVersion(): Promise<boolean> {
        const result = await this.remove(STORAGE_KEYS.USER_LAST_SEEN_VERSION);
        return result.success;
    }
}

export const userVersionStorage = new UserVersionStorage();
