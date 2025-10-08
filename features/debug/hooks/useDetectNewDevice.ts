import { checkAndPromptEncryptionLinking } from "@/features/encryption/utils/detectNewDevice";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useUser } from "@clerk/clerk-expo";
import { useCallback, useState } from "react";
import { useToast } from "../../../shared/hooks";

export default function useDetectNewDevice() {
    const { user } = useUser();
    const [detectResult, setDetectResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useToast();

    const detect = useCallback(async () => {
        setIsLoading(true);
        try {
            const userId = user?.id ?? null;
            await checkAndPromptEncryptionLinking(userId);
            setDetectResult("Triggered checkAndPromptEncryptionLinking");
        } catch (err) {
            GlobalErrorHandler.logError(
                err as Error,
                "DEBUG_DETECT_NEW_DEVICE",
            );
            showError?.(
                err instanceof Error
                    ? err.message
                    : "Failed to detect new device",
            );
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
