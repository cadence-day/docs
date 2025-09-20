/**
 * Reusable hitSlop constants and helpers.
 * Move repeated hardcoded `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}`
 * usages to this file and import the named constants where needed.
 */
export const HIT_SLOP_10 = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
} as const;

/**
 * Create a symmetric hitSlop where all sides use the same value.
 * Example: `makeHitSlop(12)` -> `{ top: 12, bottom: 12, left: 12, right: 12 }`
 */
export const makeHitSlop = (
    value: number,
) => ({ top: value, bottom: value, left: value, right: value } as const);

/**
 * Type for hitSlop objects used across the app.
 */
export type HitSlop = typeof HIT_SLOP_10;

export default HIT_SLOP_10;
