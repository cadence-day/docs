/**
 * Extracts error message from unknown error type
 */
export function extractErrorMessage(
    error: unknown,
    operationName: string,
): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    return `Failed to ${operationName}`;
}

/**
 * Creates error state object for store updates
 */
export function createErrorState(error: unknown, operationName: string) {
    return {
        error: extractErrorMessage(error, operationName),
        isLoading: false,
    };
}

/**
 * Creates loading state object for store updates
 */
export function createLoadingState() {
    return {
        isLoading: true,
        error: null,
    };
}

/**
 * Creates success state object for store updates
 */
export function createSuccessState() {
    return {
        isLoading: false,
    };
}
