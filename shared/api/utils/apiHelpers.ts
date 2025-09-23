// Utility functions for API operations
import { apiCache } from "./cache";
import { handleApiErrorWithRetry, RetryOptions } from "./errorHandler";

export interface ApiCallOptions extends RetryOptions {
  useCache?: boolean;
  cacheTtl?: number;
  cacheKey?: string;
}

/**
 * Returns the first error message from a Supabase error or a default message.
 */
export function getSupabaseErrorMessage(
  error: unknown,
  defaultMsg = "Unknown error",
): string {
  if (!error) return defaultMsg;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === "string") return errObj.message;
    if (typeof errObj.error_description === "string") return errObj.error_description;
  }
  return defaultMsg;
}

/**
 * Safely select a single row from Supabase response.
 */
export function getSingle<T>(data: T | null, error: unknown): T | null {
  if (error) throw new Error(getSupabaseErrorMessage(error));
  return data;
}

/**
 * Converts all ISO date strings in an object or array from UTC to local Date objects.
 */
export function convertDatesToLocal<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(convertDatesToLocal) as unknown as T;
  }
  if (data && typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
      const value = (data as Record<string, unknown>)[key];
      if (typeof value === "string" && isIsoDateString(value)) {
        result[key] = new Date(value);
      } else if (typeof value === "object" && value !== null) {
        result[key] = convertDatesToLocal(value);
      } else {
        result[key] = value;
      }
    }
    return result as unknown as T;
  }
  return data;
}

/**
 * Converts all Date objects in an object or array to UTC ISO strings for requests.
 */
export function convertDatesToUTC<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(convertDatesToUTC) as unknown as T;
  }
  if (data && typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
      const value = (data as Record<string, unknown>)[key];
      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else if (typeof value === "object" && value !== null) {
        result[key] = convertDatesToUTC(value);
      } else {
        result[key] = value;
      }
    }
    return result as unknown as T;
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
 * API call wrapper with caching, retry logic, and performance monitoring.
 * Usage: await apiCall(() => supabaseClient.from(...).select(...), { useCache: true })
 */
export async function apiCall<T>(
  fn: () => Promise<{ data: T; error: unknown }>,
  options: ApiCallOptions = {},
): Promise<T> {
  const {
    useCache = false,
    cacheTtl = 5 * 60 * 1000, // 5 minutes default
    cacheKey,
    ...retryOptions
  } = options;

  // Check cache first if enabled
  if (useCache && cacheKey) {
    const cached = apiCache.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const apiCallFn = async (): Promise<T> => {
    const { data, error } = await fn();
    if (error) throw error;
    return convertDatesToLocal(data);
  };

  try {
    const result = await handleApiErrorWithRetry(
      "apiCall",
      apiCallFn,
      retryOptions,
    );

    // Cache successful result if caching is enabled
    if (useCache && cacheKey && result) {
      apiCache.set(cacheKey, result, cacheTtl);
    }

    return result;
  } catch (error) {
    throw new Error(getSupabaseErrorMessage(error));
  }
}
