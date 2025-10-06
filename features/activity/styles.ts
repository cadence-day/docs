import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { getShadowStyle, ShadowLevel } from "@/shared/utils/shadowUtils";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
    padding: 16,
    ...getShadowStyle(ShadowLevel.Low),
  },
  // ActivityBox / placeholders
  activityBoxContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activityBox: {
    borderRadius: 2,
  },
  activityLabel: {
    ...TYPOGRAPHY.body.small,
    color: "#fff",
    marginTop: 4,
    marginBottom: 16,
    width: "100%",
    textAlign: "left",
    lineHeight: 14,
    minHeight: 28,
  },
  disabledActivityBox: {
    opacity: 0.6,
  },
  placeholderBox: {
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  // Text-style placeholder used for labels
  placeholderTextLabel: {
    ...TYPOGRAPHY.body.small,
    color: "#999",
    textAlign: "center",
  },
  // Block-style placeholder used as gray bars in skeletons
  placeholderBlock: {
    backgroundColor: "#666",
    borderRadius: 2,
  },
  // GridView specific styles
  gridCellWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  gridPlaceholderBorder: {
    borderStyle: "solid",
  },
  placeholderTextContainer: {
    marginTop: 4,
    marginBottom: 16,
    alignItems: "flex-start",
    width: "100%",
    minHeight: 28,
  },
  plusIcon: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: "#A1A1A1",
    textAlign: "center",
  },
  addText: {
    ...TYPOGRAPHY.label.small,
    color: "#A1A1A1",
    textAlign: "left",
  },
  editContainer: {
    flex: 1,
    padding: 16,
  },
  shakeAnimation: {
    // Shake animation styles will be applied via Animated.Value
  },
  deleteButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    ...getShadowStyle(ShadowLevel.Medium),
  },
  deleteButtonText: {
    ...TYPOGRAPHY.body.medium,
    color: "#fff",
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  // ActivityForm styles (flattened)
  formContainer: {
    flex: 1,
    width: "100%",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    ...TYPOGRAPHY.label.small,
    color: "#fff",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#6646EC",
    borderBottomWidth: 0.5,
    minHeight: 36,
    minWidth: "100%",
  },
  textInput: {
    ...TYPOGRAPHY.specialized.input,
    flex: 1,
    color: "#fff",
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  errorText: {
    ...TYPOGRAPHY.specialized.status.error,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 4,
  },
  colorButton: {
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#6646EC",
    borderBottomWidth: 0.5,
  },
  colorButtonText: {
    ...TYPOGRAPHY.body.medium,
    color: "#fff",
    fontWeight: TYPOGRAPHY.weights.medium,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  colorGrid: {
    marginTop: 10,
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#fff",
  },
  pickerContainer: {
    backgroundColor: "#222",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 150,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  pickerItemText: {
    ...TYPOGRAPHY.body.medium,
    color: "#fff",
  },
  sliderLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    ...TYPOGRAPHY.body.small,
    color: "#9CA3AF",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  sliderContainer: {
    position: "relative",
    height: 40,
    marginVertical: 8,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "#374151",
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: "#6366F1",
    borderRadius: 2,
  },
  sliderThumbContainer: {
    position: "absolute",
    width: "100%",
    height: 40,
    justifyContent: "center",
    pointerEvents: "none",
  },
  sliderThumb: {
    position: "absolute",
    width: 20,
    height: 20,
    marginLeft: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderThumbInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#6366F1",
    borderWidth: 3,
    borderColor: "#fff",
    ...getShadowStyle(ShadowLevel.Medium),
  },
  sliderThumbDragging: {
    transform: [{ scale: 1.2 }],
    backgroundColor: "#5B56F0",
  },
  weightDescription: {
    ...TYPOGRAPHY.body.small,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
