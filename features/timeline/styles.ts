import { StyleSheet } from "react-native";
import {
  TIMESLICE_BORDER_RADIUS,
  TIMESLICE_MARGIN_HORIZONTAL,
  TIMESLICE_WIDTH,
} from "./constants/dimensions";

export const styles = StyleSheet.create({
  currentTimeLabel: {
    fontWeight: "800",
    fontFamily: "FoundersGrotesk-Medium",
    fontSize: 12,
    marginBottom: 4,
  },
  // Slightly smaller variants for 12-hour time strings so AM/PM fits on one line
  currentTimeLabel12: {
    fontWeight: "800",
    fontFamily: "FoundersGrotesk-Medium",
    fontSize: 9,
    marginBottom: 4,
  },
  emptyTimeslice: {
    backgroundColor: "transparent",
  },

  // TimeSlice component styles
  timeSliceContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: TIMESLICE_WIDTH,
    marginHorizontal: TIMESLICE_MARGIN_HORIZONTAL,
  },
  timeSliceText: {
    color: "#222",
    fontFamily: "FoundersGrotesk-Medium",
    fontSize: 12,
    marginBottom: 4,
  },
  timeSliceText12: {
    color: "#222",
    fontFamily: "FoundersGrotesk-Medium",
    fontSize: 9,
    marginBottom: 4,
  },
  timeSliceBox: {
    flex: 1,
    width: "100%",
    borderRadius: TIMESLICE_BORDER_RADIUS,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
  },
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
  scrollWrapper: {
    flex: 1,
  },
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
    paddingVertical: 6,
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
    marginLeft: 6,
    fontSize: 10,
    fontWeight: "700",
  },
  metadataEnergyText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: "700",
  },
});
