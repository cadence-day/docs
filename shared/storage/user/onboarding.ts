import { BaseStorage } from "@/shared/storage/base";
import { STORAGE_KEYS } from "@/shared/storage/types";

class UserOnboardingStorage extends BaseStorage {
    constructor() {
        // namespace by app name to avoid collisions
        super("cadence_user");
    }

    async getShown(): Promise<boolean> {
        const result = await this.get<boolean>(
            STORAGE_KEYS.USER_ONBOARDING,
            false,
        );
        return !!result.data;
    }

    async setShown(shown = true): Promise<boolean> {
        const result = await this.set<boolean>(
            STORAGE_KEYS.USER_ONBOARDING,
            shown,
        );
        return result.success;
    }

    async clearShown(): Promise<boolean> {
        const result = await this.remove(STORAGE_KEYS.USER_ONBOARDING);
        return result.success;
    }
}

export const userOnboardingStorage = new UserOnboardingStorage();
