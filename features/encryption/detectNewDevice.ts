import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { hasEncryptionKey } from "@/shared/api/encryption/core";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import useDialogStore from "@/shared/stores/useDialogStore";

/**
 * Check whether this looks like a new device scenario and prompt the linking dialog.
 * Heuristic: user has server data with `enc:` prefix, and this device has no key persisted yet.
 */
export async function checkAndPromptEncryptionLinking(userId: string | null) {
  try {
    if (!userId) return;
    const hasKey = await hasEncryptionKey();
    if (hasKey) return;

    // Probe activities first
    const { data: acts, error: aErr } = await supabaseClient
      .from("activities")
      .select("name")
      .eq("user_id", userId)
      .limit(1);
    if (aErr) {
      GlobalErrorHandler.logWarning(
        "Probe activities failed; falling back to notes",
        "encryption.detectNewDevice",
        { aErr }
      );
    }
    const encPrefix = "enc:";
    const foundEncInActivities = (acts || []).some((r: any) =>
      typeof r?.name === "string" ? r.name.startsWith(encPrefix) : false
    );

    let foundEncInNotes = false;
    if (!foundEncInActivities) {
      const { data: notes, error: nErr } = await supabaseClient
        .from("notes")
        .select("message")
        .eq("user_id", userId)
        .limit(1);
      if (nErr) {
        GlobalErrorHandler.logWarning(
          "Probe notes failed",
          "encryption.detectNewDevice",
          { nErr }
        );
      }
      foundEncInNotes = (notes || []).some((r: any) =>
        typeof r?.message === "string" ? r.message.startsWith(encPrefix) : false
      );
    }

    if (foundEncInActivities || foundEncInNotes) {
      GlobalErrorHandler.logWarning(
        "New device suspected – prompting link dialog",
        "encryption.detectNewDevice",
        {}
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
    }
  } catch (error) {
    GlobalErrorHandler.logError(error as Error, "ENCRYPTION_DETECT_NEW_DEVICE", {});
  }
}

