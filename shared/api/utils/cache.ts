// Simple in-memory cache with TTL support
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new ApiCache();

// Cache key builders
export const buildCacheKey = {
  activity: (id: string) => `activity:${id}`,
  userActivities: (userId: string, status?: string) =>
    `user_activities:${userId}${status ? `:${status}` : ""}`,
  activitiesByCategory: (categoryId: string) =>
    `activities_by_category:${categoryId}`,
  note: (id: string) => `note:${id}`,
  userNotes: (userId: string) => `user_notes:${userId}`,
  state: (id: string) => `state:${id}`,
  timeslice: (id: string) => `timeslice:${id}`,
};
