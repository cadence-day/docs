import { COLORS } from "@/shared/constants/COLORS";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";
import { REFLECTION_LAYOUT } from "./constants/layout";

export const reflectionStyles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  gridContainer: {
    flex: 1,
    marginTop: 10,
  },
  dateNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  navigationButton: {
    padding: 1,
  },
  navigationArrow: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: "#000",
  },
  dateRangeText: {
    ...TYPOGRAPHY.body.medium,
    marginHorizontal: 10,
    color: "#000",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    ...TYPOGRAPHY.specialized.input,
    color: COLORS.error || "#ff6b6b",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    ...TYPOGRAPHY.specialized.input,
    color: "white",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // LineItem component styles
  lineItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  lineItemNoteContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  lineItemLabel: {
    ...TYPOGRAPHY.body.medium,
    color: "#A1A1A1",
  },
  lineItemValue: {
    ...TYPOGRAPHY.body.medium,
    color: "#fff",
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  lineItemNote: {
    ...TYPOGRAPHY.body.small,
    color: "#fff",
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 10,
  },

  // ReflectionCell component styles
  cell: {
    borderWidth: REFLECTION_LAYOUT.BORDER_WIDTH,
    borderColor: COLORS.primary,
    marginBottom: REFLECTION_LAYOUT.CELL_MARGIN,
    marginRight: REFLECTION_LAYOUT.CELL_MARGIN,
    height: REFLECTION_LAYOUT.CELL_HEIGHT,
    flex: 1,
    position: "relative" as const,
  },
  cellContent: {
    flex: 1,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 1,
    height: "100%",
  },
  cellLeftIcon: {
    position: "absolute" as const,
    left: 1,
    top: "50%",
    marginTop: -5, // Half of the icon height (10px / 2 = 5px)
    zIndex: 1,
  },
  cellRightContent: {
    position: "absolute" as const,
    right: 1,
    top: "50%",
    marginTop: -4, // Approximate half height of the energy icon + text content
    flexDirection: "row" as const,
    alignItems: "center" as const,
    zIndex: 1,
  },
  cellRightItem: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  cellEnergyText: {
    fontSize: TYPOGRAPHY.sizes.micro,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: 1,
    lineHeight: 8,
  },
  emptyCell: {
    borderWidth: REFLECTION_LAYOUT.BORDER_WIDTH,
    borderColor: `${COLORS.primary}80`, // 0.5 opacity (80 in hex = 0.5 * 255)
    marginBottom: REFLECTION_LAYOUT.CELL_MARGIN,
    marginRight: REFLECTION_LAYOUT.CELL_MARGIN,
    height: REFLECTION_LAYOUT.CELL_HEIGHT,
    flex: 1,
    opacity: 0.7,
  },
  energyText: {
    fontSize: TYPOGRAPHY.sizes.tiny,
    color: "white",
    textAlign: "center",
  },

  // ReflectionDateAxis component styles
  dateHeaderRow: {
    flexDirection: "row",
    position: "absolute",
    top: 0,
    left: REFLECTION_LAYOUT.TIME_COLUMN_WIDTH,
    right: 0,
    height: REFLECTION_LAYOUT.HEADER_HEIGHT,
    zIndex: 2,
  },
  dateHeaderCell: {
    marginRight: REFLECTION_LAYOUT.CELL_MARGIN,
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  selectedDateHeader: {
    fontWeight: "bold",
  },
  dayHeader: {
    color: "black",
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 2,
    textAlign: "left",
  },
  dateHeader: {
    color: "black",
    fontSize: TYPOGRAPHY.sizes.mini,
    textAlign: "left",
  },
  selectedDateText: {
    fontWeight: "bold",
  },

  // ReflectionGrid component styles
  reflectionGridContainer: {
    flex: 1,
  },
  reflectionGridGridContainer: {
    flex: 1,
  },
  reflectionGridGrid: {
    flexDirection: "row",
  },
  reflectionGridDateColumn: {
    flex: 1,
  },
  reflectionGridSelectedDateColumn: {},
  reflectionGridNotSelectedDateColumn: {
    opacity: REFLECTION_LAYOUT.SELECTED_OPACITY,
  },
  reflectionGridSelectedRow: {},
  reflectionGridNotSelectedRow: {
    opacity: REFLECTION_LAYOUT.SELECTED_OPACITY,
  },
  reflectionGridDefaultRow: {},
  reflectionGridDefaultDateColumn: {},
  reflectionGridCell: {
    width: 40,
    height: REFLECTION_LAYOUT.ROW_HEIGHT,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  reflectionGridRoot: {
    flex: 1,
    marginBottom: 8,
  },
  reflectionGridContentContainer: {
    flex: 1,
  },
  reflectionGridFixedDateAxisContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: REFLECTION_LAYOUT.HEADER_HEIGHT,
  },
  reflectionGridScrollableContainer: {
    position: "absolute",
    top: REFLECTION_LAYOUT.HEADER_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
  },
  reflectionGridScrollContentContainer: {
    height: "100%",
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 0,
  },

  // ReflectionTimeAxis component styles
  hourColumn: {
    height: "100%",
    width: REFLECTION_LAYOUT.TIME_COLUMN_WIDTH,
    zIndex: 1,
  },
  headerSpacer: {
    height: REFLECTION_LAYOUT.HEADER_HEIGHT,
  },
  hourCell: {
    alignItems: "flex-start",
    height: REFLECTION_LAYOUT.ROW_HEIGHT,
    justifyContent: "center",
    paddingLeft: 2,
  },
  transparentCell: {
    backgroundColor: "transparent",
  },
  hourText: {
    color: "black",
    fontSize: TYPOGRAPHY.sizes.xs,
  },

  // ReflectionTimesliceInfo component styles
  timesliceInfoContainer: {
    width: "90%",
    paddingHorizontal: 20,
  },
  timesliceInfoContent: {
    paddingVertical: 10,
  },
  timesliceInfoActivityContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  timesliceInfoNoDataText: {
    textAlign: "center",
    color: "#666",
    fontSize: TYPOGRAPHY.sizes.lg,
    marginTop: 20,
  },
  timesliceInfoNotesHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
  },
  timesliceInfoNotesHeaderText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textIcons,
    marginBottom: 4,
  },
  timesliceInfoStatsHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
  },
  timesliceInfoStatsHeaderText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textIcons,
    marginBottom: 4,
  },
});

export default reflectionStyles;
