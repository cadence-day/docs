import { create } from "zustand";
import type { ActivityCategory } from "@/shared/types/models";
import * as activitiesCategoriesApi from "@/shared/api/resources/activitiesCategories";
import {
    type BaseStoreState,
    handleGetApiCall,
    handleVoidApiCallWithResult,
} from "./utils";

interface ActivityCategoriesStore extends BaseStoreState {
    // State
    categories: ActivityCategory[];

    // Operations
    getAllCategories: () => Promise<ActivityCategory[]>;
    refresh: () => Promise<void>;

    // Utility functions
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

const useActivityCategoriesStore = create<ActivityCategoriesStore>((set) => ({
    // Initial state
    categories: [],
    isLoading: false,
    error: null,

    // Get operations
    getAllCategories: async () => {
        return handleGetApiCall(
            set,
            () => activitiesCategoriesApi.getAllActivityCategories(),
            "get all activity categories",
            [],
        );
    },

    // Refresh operation that updates local state
    refresh: async () => {
        return handleVoidApiCallWithResult(
            set,
            () => activitiesCategoriesApi.getAllActivityCategories(),
            "refresh activity categories",
            (categories) => ({
                categories,
            }),
        );
    },

    // Utility functions
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    reset: () => set({ categories: [], isLoading: false, error: null }),
}));

export default useActivityCategoriesStore;
