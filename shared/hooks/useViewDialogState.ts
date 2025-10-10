import useDialogStore from "@/shared/stores/useDialogStore";
import { ViewDialogState } from "@/shared/types/dialog.types";
import { useEffect, useState } from "react";

/**
 * Hook to access dialog state information for the current view
 *
 * @param viewName - Optional view name. If not provided, uses the current view from the store
 * @returns ViewDialogState object containing all dialog information for the view
 *
 * @example
 * ```tsx
 * const dialogState = useViewDialogState("home");
 *
 * // Access dialog information
 * console.log(dialogState.count); // Number of open dialogs
 * console.log(dialogState.totalVisibleHeight); // Combined height of visible dialogs
 *
 * // Iterate over dialogs
 * dialogState.dialogs.forEach(dialog => {
 *   console.log(dialog.dialogId, dialog.height, dialog.isCollapsed);
 * });
 * ```
 */
export function useViewDialogState(viewName?: string): ViewDialogState {
    const [dialogState, setDialogState] = useState<ViewDialogState>(() =>
        useDialogStore.getState().getDialogStateForView(viewName)
    );

    useEffect(() => {
        // Update state whenever the dialog store changes
        const unsubscribe = useDialogStore.subscribe(() => {
            const newState = useDialogStore.getState().getDialogStateForView(
                viewName,
            );
            setDialogState(newState);
        });

        return unsubscribe;
    }, [viewName]);

    return dialogState;
}

/**
 * Hook to get a specific dialog's state information
 *
 * @param dialogId - The ID of the dialog to get information for
 * @returns DialogStateInfo object or undefined if dialog doesn't exist
 *
 * @example
 * ```tsx
 * const activityDialog = useDialogInfo("activity-legend-home");
 *
 * if (activityDialog) {
 *   console.log(activityDialog.height, activityDialog.isCollapsed);
 * }
 * ```
 */
export function useDialogInfo(dialogId: string) {
    const [dialogInfo, setDialogInfo] = useState(() =>
        useDialogStore.getState().getDialogInfo(dialogId)
    );

    useEffect(() => {
        const unsubscribe = useDialogStore.subscribe(() => {
            const newInfo = useDialogStore.getState().getDialogInfo(dialogId);
            setDialogInfo(newInfo);
        });

        return unsubscribe;
    }, [dialogId]);

    return dialogInfo;
}
