/**
 * Dialog State Types
 *
 * These types represent the state of dialogs open on a screen/view.
 * Views can access this information to understand which dialogs are currently active.
 */

/**
 * Represents the state of a single dialog on a screen
 */
export interface DialogStateInfo {
    /** Unique identifier for the dialog */
    dialogId: string;

    /** Type of dialog (e.g., 'activity-legend', 'calendar', etc.) */
    dialogType: string;

    /** Height of the dialog as a percentage (0-100) */
    height: number;

    /** Whether the dialog is collapsed or open */
    isCollapsed: boolean;

    /** Whether dragging/resizing is enabled for this dialog */
    enableDragging: boolean;

    /** Views where this dialog is allowed to appear */
    allowedViews: string[];

    /** Whether the close button is shown */
    showCloseButton: boolean;

    /** Current z-index of the dialog */
    zIndex: number;

    /** Position of the dialog ('dock' or coordinates) */
    position: "dock" | { x: number; y: number };

    /** Whether this dialog can be closed by user action */
    preventClose: boolean;

    /** Whether this dialog is global (appears in all views) */
    isGlobal: boolean;

    /** The view this dialog is specific to (if any) */
    viewSpecific?: string;
}

/**
 * Represents the complete dialog state for a view
 */
export interface ViewDialogState {
    /** Array of all dialogs open on this view */
    dialogs: DialogStateInfo[];

    /** The current view name/identifier */
    viewName: string;

    /** Total number of open dialogs */
    count: number;

    /** Whether any dialog is currently being dragged */
    isAnyDialogDragging: boolean;

    /** Combined height of all non-collapsed dialogs (for layout calculations) */
    totalVisibleHeight: number;
}

/**
 * Helper type for dialog height tracking
 */
export interface DialogHeightInfo {
    dialogId: string;
    height: number;
    isCollapsed: boolean;
}
