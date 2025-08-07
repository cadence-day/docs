// Utility functions for API operations

/**
 * Returns the first error message from a Supabase error or a default message.
 */
export function getSupabaseErrorMessage(
    error: any,
    defaultMsg = "Unknown error",
): string {
    if (!error) return defaultMsg;
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    return defaultMsg;
}

/**
 * Safely select a single row from Supabase response.
 */
export function getSingle<T>(data: T | null, error: any): T | null {
    if (error) throw new Error(getSupabaseErrorMessage(error));
    return data;
}

/**
 * Converts all ISO date strings in an object or array from UTC to local Date objects.
 */
export function convertDatesToLocal<T>(data: T): T {
    if (Array.isArray(data)) {
        return data.map(convertDatesToLocal) as any;
    }
    if (data && typeof data === "object") {
        const result: any = {};
        for (const key in data) {
            const value = (data as any)[key];
            if (typeof value === "string" && isIsoDateString(value)) {
                result[key] = new Date(value);
            } else if (typeof value === "object" && value !== null) {
                result[key] = convertDatesToLocal(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return data;
}

/**
 * Converts all Date objects in an object or array to UTC ISO strings for requests.
 */
export function convertDatesToUTC<T>(data: T): T {
    if (Array.isArray(data)) {
        return data.map(convertDatesToUTC) as any;
    }
    if (data && typeof data === "object") {
        const result: any = {};
        for (const key in data) {
            const value = (data as any)[key];
            if (value instanceof Date) {
                result[key] = value.toISOString();
            } else if (typeof value === "object" && value !== null) {
                result[key] = convertDatesToUTC(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }
    return data;
}

/**
 * Checks if a string is an ISO date string (UTC).
 */
function isIsoDateString(value: string): boolean {
    // Simple ISO 8601 check
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/.test(value);
}

/**
 * Centralized API call wrapper for error handling and date conversion.
 * Usage: await apiCall(() => supabaseClient.from(...).select(...))
 */
export async function apiCall<T>(
    fn: () => Promise<{ data: T; error: any }>,
): Promise<T> {
    try {
        const { data, error } = await fn();
        if (error) throw error;
        return convertDatesToLocal(data);
    } catch (error) {
        // Optionally, you can import and use handleApiError here
        throw new Error(getSupabaseErrorMessage(error));
    }
}
