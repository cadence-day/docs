import { useCallback, useState } from "react";
import type { UseActivityLegendReturn } from "../types";

export const useActivityLegend = (): UseActivityLegendReturn => {
  const [isVisible, setIsVisible] = useState(true); // Default to visible like the original

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  return {
    isVisible,
    show,
    hide,
    toggle,
  };
};
