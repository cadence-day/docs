/**
 * Feature Flags System
 *
 * A feature is enabled if ANY of the following conditions are true:
 * 1. isDev is true (development mode)
 * 2. Manual toggle is true (for testing in production builds)
 * 3. PostHog feature flag returns true
 *
 * Usage:
 * const isChatEnabled = useFeatureFlag('chat');
 *
 * if (isChatEnabled === undefined) {
 *   // Loading state
 *   return <LoadingSpinner />;
 * }
 *
 * if (!isChatEnabled) {
 *   // Feature disabled
 *   return null;
 * }
 *
 * // Feature enabled - render the component
 */

import { isDev } from "@/shared/constants/isDev";
import { Logger } from "@/shared/utils/errorHandler";
import { useFeatureFlag as usePostHogFeatureFlag } from "posthog-react-native";

/**
 * Manual feature flag toggles
 * Set to true to manually enable a feature regardless of PostHog flag
 * Useful for testing features in production builds or bypassing PostHog checks
 */
const MANUAL_FEATURE_TOGGLES: Record<string, boolean> = {
  "chat": false,
  "weekly-insights": true,
  "monthly-reflection": true,
  "timeline-view-toggle": false,
};

/**
 * Hook to check if a feature is enabled
 *
 * A feature is enabled if:
 * - isDev is true, OR
 * - Manual toggle for the feature is true, OR
 * - PostHog feature flag is true
 *
 * @param flagKey - The feature flag key (e.g., 'chat', 'weekly-insights')
 * @returns boolean | undefined - true if enabled, false if disabled, undefined if loading
 */
export function useFeatureFlag(flagKey: string): boolean | undefined {
  const posthogFlag = usePostHogFeatureFlag(flagKey);
  const manualToggle = MANUAL_FEATURE_TOGGLES[flagKey] ?? false;

  // If we're in dev mode and manual toggle is enabled, feature is always enabled
  if (isDev && manualToggle) {
    return true;
  }

  // Return the PostHog flag value (undefined while loading, boolean once loaded)
  if (typeof posthogFlag === "boolean" || typeof posthogFlag === "undefined") {
    return posthogFlag;
  }
  // If PostHog returns a string or other type, treat truthy as enabled
  return !!posthogFlag;
}

/**
 * Get all feature flags status for debugging
 */
export function getFeatureFlagsStatus(): Record<
  string,
  { isDev: boolean; manual: boolean; flagKey: string }
> {
  const status: Record<
    string,
    { isDev: boolean; manual: boolean; flagKey: string }
  > = {};

  Object.keys(MANUAL_FEATURE_TOGGLES).forEach((key) => {
    status[key] = {
      isDev,
      manual: MANUAL_FEATURE_TOGGLES[key],
      flagKey: key,
    };
  });

  return status;
}

/**
 * Log feature flag status for debugging
 */
export function logFeatureFlagStatus(
  flagKey: string,
  isEnabled: boolean | undefined,
): void {
  const manualToggle = MANUAL_FEATURE_TOGGLES[flagKey] ?? false;

  let evaluatedAs: string;
  if (isEnabled === undefined) {
    evaluatedAs = "loading";
  } else if (isEnabled) {
    evaluatedAs = "enabled";
  } else {
    evaluatedAs = "disabled";
  }

  Logger.logDebug(
    `Feature flag status for '${flagKey}'`,
    "FEATURE_FLAG",
    {
      flagKey,
      isEnabled,
      isDev,
      manualToggle,
      evaluatedAs,
    },
  );
}
