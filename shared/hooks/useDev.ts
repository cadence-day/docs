import { isDev } from "@/shared/constants/isDev";
import { useMemo } from "react";

/**
 * Global hook to determine if we are in a development environment
 * @returns boolean indicating if we're in development mode
 */
export const useDev = (): boolean => {
  return useMemo(() => isDev, []);
};

/**
 * Utility function (non-hook) to check development environment
 * Use this in non-React contexts where hooks cannot be used
 */
export const getIsDev = (): boolean => isDev;
