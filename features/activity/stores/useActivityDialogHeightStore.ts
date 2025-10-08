import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ActivityDialogHeightStore {
    // State: Map of dialog IDs to their heights
    dialogHeights: Record<string, number>;

    // Actions
    setDialogHeight: (dialogId: string, height: number) => void;
    getDialogHeight: (dialogId: string) => number | null;
    clearDialogHeight: (dialogId: string) => void;
    clearAllDialogHeights: () => void;
}

export const useActivityDialogHeightStore = create<ActivityDialogHeightStore>()(
    persist(
        (set, get) => ({
            // Initial state
            dialogHeights: {},

            // Set or update height for a specific dialog ID
            setDialogHeight: (dialogId: string, height: number) =>
                set((state) => ({
                    dialogHeights: {
                        ...state.dialogHeights,
                        [dialogId]: height,
                    },
                })),

            // Get height for a specific dialog ID
            getDialogHeight: (dialogId: string) => {
                return get().dialogHeights[dialogId] ?? null;
            },

            // Clear height for a specific dialog ID
            clearDialogHeight: (dialogId: string) =>
                set((state) => {
                    const newHeights = { ...state.dialogHeights };
                    delete newHeights[dialogId];
                    return { dialogHeights: newHeights };
                }),

            // Clear all dialog heights
            clearAllDialogHeights: () => set({ dialogHeights: {} }),
        }),
        {
            name: "activity-dialog-heights", // Storage key
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);
