import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import {
  withDebugBorder,
  withDebugBorderDashed,
  withDebugBorderThick,
} from "@/shared/constants/isDev";
import { Platform, StyleSheet } from "react-native";
import {
  TIMESLICE_BORDER_RADIUS,
  TIMESLICE_MARGIN_HORIZONTAL,
  TIMESLICE_WIDTH,
} from "./dimensions";

export const styles = StyleSheet.create({
  currentTimeLabel: {
    ...TYPOGRAPHY.specialized.time.regular,
    marginBottom: 4,
  },
  // Slightly smaller variants for 12-hour time strings so AM/PM fits on one line
  currentTimeLabel12: {
    ...TYPOGRAPHY.specialized.time.compact,
    marginBottom: 4,
  },
  emptyTimeslice: {
    backgroundColor: "transparent",
  },

  // TimeSlice component styles
  timeSliceContainer: withDebugBorderThick({
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: TIMESLICE_WIDTH,
    marginHorizontal: TIMESLICE_MARGIN_HORIZONTAL,
    // Ensure shadows can render on Android (avoid overflow hidden in parents)
    overflow: Platform.OS === "android" ? "visible" : "visible",
  }),
  timeSliceText: {
    ...TYPOGRAPHY.specialized.time.regular,
    color: "#222",
    marginBottom: 4,
  },
  timeSliceText12: {
    ...TYPOGRAPHY.specialized.time.compact,
    color: "#222",
    marginBottom: 4,
  },
  timeSliceBox: withDebugBorder({
    flex: 1,
    width: "100%",
    borderRadius: TIMESLICE_BORDER_RADIUS,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
    // Use a small elevation baseline to prevent harsh Android shadow jumps
    elevation: 1,
  }),
  timeSliceIconContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "absolute",
    top: 15,
    left: 0,
    right: 0,
  },
  // Timeline container wrappers
  scrollWrapper: withDebugBorderDashed({
    flex: 1,
  }),
  scrollWrapperContent: {
    flex: 1,
  },
  horizontalContainer: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  horizontalContent: {
    alignItems: "stretch",
  },
  // TimeSlice overlay used for metadata vertical placement
  timeSliceOverlay: {
    position: "absolute",
    top: 32,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    pointerEvents: "none",
  },
  // MetadataVertical styles
  metadataContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    pointerEvents: "none",
    marginTop: 20,
    gap: 12,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  metadataCountText: {
    ...TYPOGRAPHY.specialized.metadata,
    marginLeft: 6,
  },
  metadataEnergyText: {
    ...TYPOGRAPHY.specialized.metadata,
    marginLeft: 4,
  },
});
