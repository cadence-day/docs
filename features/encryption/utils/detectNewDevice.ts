import { hasEncryptionKey } from "@/shared/api/encryption/core";
import useTimeslicesStore from "@/shared/stores/resources/useTimeslicesStore";
import useDialogStore from "@/shared/stores/useDialogStore";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

/**
 * Check whether this looks like a new device scenario and prompt the linking dialog.
 * Heuristic: user has server data with `enc:` prefix, and this device has no key persisted yet.
 */
export async function checkAndPromptEncryptionLinking(userId: string | null) {
  try {
    if (!userId) return;
    // Fast local heuristic: if the local timeslices store already contains
    // timeslices for this user/device and we don't have an encryption key,
    // that's a strong signal this is a new device — prompt the link dialog
    // immediately without probing the server.
    try {
      const timeslicesStore = useTimeslicesStore.getState();
      const timeslices = timeslicesStore.getAllTimeslices();
      const hasLocalTimeslices = Array.isArray(timeslices) &&
        timeslices.length > 0;
      if (hasLocalTimeslices) {
        const hasKeyLocal = await hasEncryptionKey();
        if (!hasKeyLocal) {
          GlobalErrorHandler.logWarning(
            "Local timeslices present and no encryption key – prompting link dialog",
            "encryption.detectNewDevice",
            {},
          );
          useDialogStore.getState().openDialog({
            type: "encryption-link",
            props: {
              height: 80,
              enableDragging: true,
              headerProps: { title: "Link This Device" },
            },
            position: "dock",
            viewSpecific: "index",
          });
          return;
        }
      }
    } catch (localErr) {
      // If the local heuristic fails for any reason, fall back to server probes.
      GlobalErrorHandler.logWarning(
        "Local timeslices heuristic failed; falling back to server probe",
        "encryption.detectNewDevice",
        { localErr },
      );
    }
  } catch (error) {
    GlobalErrorHandler.logError(
      error as Error,
      "ENCRYPTION_DETECT_NEW_DEVICE",
      {},
    );
  }
}
