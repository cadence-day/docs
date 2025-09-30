import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 20,
  },
  notesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.specialized.input,
    color: "#FFFFFF",
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 12,
  },
  scrollContentContainerKeyboard: {
    paddingBottom: 120,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  noteContainer: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  addNewNoteButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  addNewNoteButtonText: { color: "#fff", textAlign: "center" },
  noteInput: {
    ...TYPOGRAPHY.specialized.input,
    color: "#FFFFFF",
    padding: 16,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "transparent",
  },
  noteInputActive: {
    borderColor: "#6366F1",
    borderWidth: 2,
  },
  noteToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  toolbarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolbarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  toolButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 36,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  toolButtonDisabled: {
    opacity: 0.5,
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6366F1",
    marginBottom: 24,
  },
  addNoteButtonText: {
    color: "#6366F1",
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: 8,
  },
  energySection: {
    marginBottom: 24,
  },
  energyBarsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  energyBar: {
    height: 40,
    width: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  energyBarActive: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  energyBarInactive: {
    backgroundColor: "transparent",
  },
  energyBarText: {
    ...TYPOGRAPHY.body.small,
    color: "#FFFFFF",
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: "uppercase",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: TYPOGRAPHY.sizes.lg,
    textAlign: "center",
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    ...TYPOGRAPHY.body.medium,
    color: "#FFFFFF",
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    ...TYPOGRAPHY.body.medium,
    color: "#EF4444",
    textAlign: "center",
  },
  // New styles for swipeable notes and keyboard toolbox
  swipeableContainer: {
    position: "relative",
    marginBottom: 12,
  },
  swipeableNoteContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    minHeight: 60,
    position: "relative",
  },
  swipeablePinnedNote: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  swipeableActiveNote: {
    borderColor: "#6366F1",
    borderWidth: 2,
  },
  swipeableNoteInput: {
    ...TYPOGRAPHY.specialized.input,
    color: "#FFFFFF",
    padding: 16,
    paddingRight: 40, // Space for pin indicator
    minHeight: 60,
    textAlignVertical: "top",
  },
  pinIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  swipeActionLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    zIndex: 1,
  },
  swipeActionRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 70,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1,
  },
  swipeActionContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  swipeActionText: {
    ...TYPOGRAPHY.body.small,
    color: "#FFFFFF",
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 4,
  },
  keyboardToolboxContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34, // Account for iPhone home indicator
  },
  keyboardToolboxContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  keyboardStatusSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  keyboardStatusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  keyboardStatusText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: TYPOGRAPHY.sizes.md,
    marginLeft: 6,
  },
  keyboardErrorText: {
    color: "#EF4444",
    fontSize: TYPOGRAPHY.sizes.md,
  },
  keyboardActionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  keyboardToolButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardToolButtonDisabled: {
    opacity: 0.5,
  },
  keyboardAddButton: {
    backgroundColor: "#6366F1",
  },
  keyboardSaveButton: {
    backgroundColor: "#10B981",
  },
  keyboardDeleteButton: {
    backgroundColor: "#EF4444",
  },
  keyboardDoneButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
  },
  keyboardDoneButtonText: {
    ...TYPOGRAPHY.specialized.input,
    color: "#FFFFFF",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  moodSelectorWithMargin: {
    marginTop: 16,
  },
});
