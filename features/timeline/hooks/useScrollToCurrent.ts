import { Logger } from "@/shared/utils/errorHandler";
import { RefObject } from "react";
import { Dimensions } from "react-native";

/**
 * Scroll the horizontal ScrollView so that the given itemIndex is centered at
 * roughly 1/3 of the screen width.
 */
export const scrollToIndexAtOneThird = (
  scrollRef: RefObject<
    { scrollTo: (options: { x: number; animated: boolean }) => void }
  >,
  itemIndex: number,
  itemWidth: number,
  itemMarginHorizontal: number,
) => {
  if (!scrollRef?.current || typeof itemIndex !== "number") return;

  const screenWidth = Dimensions.get("window").width;
  const desiredCenterX = screenWidth / 3; // one-third from left

  // Compute the target x for the left edge of the ScrollView content so that
  // the item center lands at desiredCenterX.
  const itemFullWidth = itemWidth + itemMarginHorizontal * 2;
  const itemCenter = itemIndex * itemFullWidth + itemFullWidth / 2;
  const targetScrollX = Math.max(0, itemCenter - desiredCenterX);

  try {
    scrollRef.current?.scrollTo({ x: targetScrollX, animated: true });
  } catch (err) {
    // Route warnings through global handler for consistent reporting
    Logger.logWarning(
      "scrollToIndexAtOneThird failed",
      "Timeline:scroll",
      { error: err },
    );
  }
};

export default scrollToIndexAtOneThird;
