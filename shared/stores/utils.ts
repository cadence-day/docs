import {
    createErrorState,
    createLoadingState,
    createSuccessState,
} from "./errorHandler";

/**
 * Base store state interface that all stores should extend
 */
export interface BaseStoreState {
    isLoading: boolean;
    error: string | null;
}

/**
 * Set function type from zustand
 */
type SetFunction<T> = (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
) => void;

/**
 * Generic API call handler for stores that manages loading states and error handling
 */
export async function handleApiCall<T, S extends BaseStoreState>(
    set: SetFunction<S>,
    apiCall: () => Promise<T>,
    operationName: string,
    defaultReturnValue: T,
    stateUpdater?: (result: T, state: S) => Partial<S>,
): Promise<T> {
    set(createLoadingState() as Partial<S>);

    try {
        const result = await apiCall();

        if (stateUpdater && result !== null && result !== undefined) {
            set((state: S) => ({
                ...stateUpdater(result, state),
                ...createSuccessState(),
            }));
        } else {
            set(createSuccessState() as Partial<S>);
        }

        return result;
    } catch (error) {
        set(createErrorState(error, operationName) as Partial<S>);
        return defaultReturnValue;
    }
}

/**
 * Simple API call handler for get operations that don't modify local state
 */
export async function handleGetApiCall<T, S extends BaseStoreState>(
    set: SetFunction<S>,
    apiCall: () => Promise<T>,
    operationName: string,
    defaultReturnValue: T,
): Promise<T> {
    return handleApiCall(set, apiCall, operationName, defaultReturnValue);
}

/**
 * API call handler for void operations (like delete, disable) that only update local state
 */
export async function handleVoidApiCall<S extends BaseStoreState>(
    set: SetFunction<S>,
    apiCall: () => Promise<any>,
    operationName: string,
    stateUpdater: (state: S) => Partial<S>,
): Promise<void> {
    set(createLoadingState() as Partial<S>);

    try {
        await apiCall();

        set((state: S) => ({
            ...stateUpdater(state),
            ...createSuccessState(),
        }));
    } catch (error) {
        set(createErrorState(error, operationName) as Partial<S>);
    }
}

/**
 * API call handler for operations that need custom processing and void return
 */
export async function handleVoidApiCallWithResult<T, S extends BaseStoreState>(
    set: SetFunction<S>,
    apiCall: () => Promise<T>,
    operationName: string,
    stateUpdater: (result: T, state: S) => Partial<S>,
): Promise<void> {
    set(createLoadingState() as Partial<S>);

    try {
        const result = await apiCall();

        set((state: S) => ({
            ...stateUpdater(result, state),
            ...createSuccessState(),
        }));
    } catch (error) {
        set(createErrorState(error, operationName) as Partial<S>);
    }
}
