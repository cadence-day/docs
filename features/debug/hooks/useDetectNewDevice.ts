import { checkAndPromptEncryptionLinking } from "@/features/encryption/utils/detectNewDevice";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";

export default function useDetectNewDevice() {
    const { user } = useUser();
    const [detectResult, setDetectResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const detect = useCallback(async () => {
        setIsLoading(true);
        try {
            const userId = user?.id ?? null;
            await checkAndPromptEncryptionLinking(userId);
            setDetectResult("Triggered checkAndPromptEncryptionLinking");
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error("detectNewDevice test failed", err);
            setDetectResult(String(err));
            try {
                GlobalErrorHandler.logError(
                    err as Error,
                    "DEBUG_DETECT_NEW_DEVICE",
                    {},
                );
            } catch {
                // ignore logging errors
            }
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    return { detect, isLoading, detectResult } as const;
}
