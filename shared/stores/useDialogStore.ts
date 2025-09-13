import type { StoreApi } from "zustand";
import { create } from "zustand";

export type DialogId = string;
export type DialogType = string;

export interface DialogSpec {
  id: DialogId;
  type: DialogType;
  props?: Record<string, any>;
  collapsed?: boolean;
  zIndex?: number;
  position?: "dock" | { x: number; y: number };
  viewSpecific?: string; // The view/route this dialog is specific to
}

interface DialogStore {
  dialogs: Record<DialogId, DialogSpec>;
  currentView: string | null; // Track the current view
  viewSpecificDialogs: Record<string, DialogSpec[]>; // Store view-specific dialogs when view is not active
  openDialog: (
    spec: Omit<DialogSpec, "id" | "zIndex"> & { id?: DialogId }
  ) => DialogId;
  closeAll: () => void;
  // Force close all dialogs, ignoring any preventClose flags.
  forceCloseAll: () => void;
  closeDialog: (id: DialogId) => void;
  toggleCollapse: (id: DialogId) => void;
  bringToFront: (id: DialogId) => void;
  setDialogProps: (id: DialogId, props: Record<string, any>) => void;
  getDialog: (id: DialogId) => DialogSpec | undefined;
  // New methods for view-specific dialog management
  setCurrentView: (viewName: string) => void;
  closeViewSpecificDialogs: (viewName: string) => void;
  restoreViewSpecificDialogs: (viewName: string) => void;
}

const makeId = () => Math.random().toString(36).slice(2, 9);

const useDialogStore = create<DialogStore>(
  (
    set: StoreApi<DialogStore>["setState"],
    get: StoreApi<DialogStore>["getState"]
  ) => ({
    dialogs: {},
    currentView: null,
    viewSpecificDialogs: {},

    openDialog: (
      spec: Omit<DialogSpec, "id" | "zIndex"> & { id?: DialogId }
    ) => {
      // Close all other non-persistent dialogs by default to enforce
      // single-open policy while preserving any dialogs that set
      // `props.preventClose` (e.g., an always-visible activity legend).
      // If a preserved dialog of the same type already exists, return its id
      // instead of creating a duplicate.
      const current = get().dialogs;
      const preserved: Record<DialogId, DialogSpec> = {};
      Object.entries(current).forEach(([id, d]) => {
        if (d.props?.preventClose) preserved[id] = d;
      });

      // Only reuse an existing preserved dialog of the same type if the
      // caller also requested a persistent dialog (props.preventClose).
      const existingSameType = spec.props?.preventClose
        ? Object.values(preserved).find((d) => d.type === spec.type)
        : undefined;
      if (existingSameType) return existingSameType.id;

      // apply the preserved set (close non-persistent ones)
      set(() => ({ dialogs: preserved }));

      const id = spec.id ?? makeId();
      const next: DialogSpec = {
        id,
        type: spec.type,
        props: spec.props ?? {},
        collapsed: spec.collapsed ?? false,
        zIndex: Object.keys(get().dialogs).length + 1,
        position: spec.position ?? "dock",
        viewSpecific: spec.viewSpecific,
      };

      set((state: DialogStore) => ({
        dialogs: { ...state.dialogs, [id]: next },
      }));
      return id;
    },

    // Close all open dialogs, preserving any dialogs that set props.preventClose
    closeAll: () =>
      set((state: DialogStore) => {
        const preserved: Record<DialogId, DialogSpec> = {};
        Object.entries(state.dialogs).forEach(([id, d]) => {
          if (d.props?.preventClose) preserved[id] = d;
        });
        return { dialogs: preserved };
      }),

    // Force close all dialogs (clear the map entirely)
    forceCloseAll: () => set(() => ({ dialogs: {} })),

    closeDialog: (id: DialogId) =>
      set((state: DialogStore) => {
        const d = state.dialogs[id];
        if (!d) return state as any;
        // Respect preventClose flag on dialogs
        if (d.props?.preventClose) return state as any;
        const copy = { ...state.dialogs };
        delete copy[id];
        return { dialogs: copy };
      }),

    toggleCollapse: (id: DialogId) =>
      set((state: DialogStore) => {
        const d = state.dialogs[id];
        if (!d) return {} as any;
        return {
          dialogs: {
            ...state.dialogs,
            [id]: { ...d, collapsed: !d.collapsed },
          },
        };
      }),

    bringToFront: (id: DialogId) =>
      set((state: DialogStore) => {
        const max = Math.max(
          0,
          ...Object.values(state.dialogs).map((d) => d?.zIndex ?? 0)
        );
        const d = state.dialogs[id];
        if (!d) return {} as any;
        return {
          dialogs: { ...state.dialogs, [id]: { ...d, zIndex: max + 1 } },
        };
      }),

    setDialogProps: (id: DialogId, props: Record<string, any>) =>
      set((state: DialogStore) => {
        const d = state.dialogs[id];
        if (!d) return {} as any;
        return {
          dialogs: {
            ...state.dialogs,
            [id]: { ...d, props: { ...d.props, ...props } },
          },
        };
      }),

    getDialog: (id: DialogId) => get().dialogs[id],

    // Set current view and handle view-specific dialog management
    setCurrentView: (viewName: string) =>
      set((state: DialogStore) => {
        // If switching from a different view, store any view-specific dialogs from the previous view
        if (state.currentView && state.currentView !== viewName) {
          const viewSpecificDialogs = Object.values(state.dialogs).filter(
            (dialog) => dialog.viewSpecific === state.currentView
          );

          // Store the dialogs for the previous view
          const updatedViewSpecificDialogs = {
            ...state.viewSpecificDialogs,
            [state.currentView]: viewSpecificDialogs,
          };

          // Remove view-specific dialogs from active dialogs
          const remainingDialogs: Record<DialogId, DialogSpec> = {};
          Object.entries(state.dialogs).forEach(([id, dialog]) => {
            if (dialog.viewSpecific !== state.currentView) {
              remainingDialogs[id] = dialog;
            }
          });

          return {
            currentView: viewName,
            dialogs: remainingDialogs,
            viewSpecificDialogs: updatedViewSpecificDialogs,
          };
        }

        return { currentView: viewName };
      }),

    // Close all dialogs specific to a view (store them for later restoration)
    closeViewSpecificDialogs: (viewName: string) =>
      set((state: DialogStore) => {
        const viewSpecificDialogs = Object.values(state.dialogs).filter(
          (dialog) => dialog.viewSpecific === viewName
        );

        if (viewSpecificDialogs.length === 0) return state;

        // Store the dialogs for later restoration
        const updatedViewSpecificDialogs = {
          ...state.viewSpecificDialogs,
          [viewName]: viewSpecificDialogs,
        };

        // Remove view-specific dialogs from active dialogs
        const remainingDialogs: Record<DialogId, DialogSpec> = {};
        Object.entries(state.dialogs).forEach(([id, dialog]) => {
          if (dialog.viewSpecific !== viewName) {
            remainingDialogs[id] = dialog;
          }
        });

        return {
          dialogs: remainingDialogs,
          viewSpecificDialogs: updatedViewSpecificDialogs,
        };
      }),

    // Restore dialogs specific to a view
    restoreViewSpecificDialogs: (viewName: string) =>
      set((state: DialogStore) => {
        const storedDialogs = state.viewSpecificDialogs[viewName];

        if (!storedDialogs || storedDialogs.length === 0) return state;

        // Restore the dialogs
        const restoredDialogs: Record<DialogId, DialogSpec> = {};
        storedDialogs.forEach((dialog) => {
          restoredDialogs[dialog.id] = dialog;
        });

        // Remove from stored dialogs
        const updatedViewSpecificDialogs = { ...state.viewSpecificDialogs };
        delete updatedViewSpecificDialogs[viewName];

        return {
          dialogs: { ...state.dialogs, ...restoredDialogs },
          viewSpecificDialogs: updatedViewSpecificDialogs,
        };
      }),
  })
);

export default useDialogStore;
