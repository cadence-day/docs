// Centralized error handler for API functions

/**
 * Handles and logs API errors, then throws a formatted error.
 */
export function handleApiError(context: string, error: any): never {
    const message = error?.message || error?.error_description ||
        String(error) || "Unknown error";
    // You can add more sophisticated logging here if needed
    console.error(`[API ERROR] [${context}]`, error);
    throw new Error(`[${context}] ${message}`);
}
