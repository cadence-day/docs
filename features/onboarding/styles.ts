import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";

export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  embeddedContent: {
    borderColor: "magenta",
    borderWidth: 0, // Set to 1 for debugging layout
    flex: 1,
    marginTop: 20,
    paddingRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pictureContainer: {
    resizeMode: "contain",
    width: "90%",
  },
  textContainer: {
    marginVertical: 8,
    width: "100%",
  },
  spacer: {
    height: 12,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: "white",
    textAlign: "left",
    marginTop: 20,
    marginBottom: 16,
  },
  titleContainer: {
    flex: 0,
    width: "60%",
    marginBottom: 8,
  },
  content: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: "white",
    textAlign: "left",
    lineHeight: 20,
    opacity: 0.9,
  },
  actionButton: {
    marginTop: 20,
    alignSelf: "center",
    width: "100%",
  },
  notificationActionButton: {
    marginTop: 8,
    alignSelf: "center",
    width: "100%",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  linkButton: {
    marginTop: 62,
    width: 200,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: TYPOGRAPHY.sizes.lg,
    opacity: 0.8,
    textAlign: "center",
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: "#CCCCCC",
    textAlign: "left",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  // Enhanced styles for new screen types
  screenContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: "white",
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  activitiesContainer: {
    flex: 1,
    marginTop: 12,
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 6,
    paddingHorizontal: 4,
  },
  activityTag: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 6,
  },
  activityTagSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    opacity: 1,
  },
  activityTagDimmed: {
    opacity: 0.4,
  },
  activityTagText: {
    ...TYPOGRAPHY.specialized.tag,
    color: "white",
    fontWeight: TYPOGRAPHY.weights.normal,
  },
  activityTagTextSelected: {
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  activityTagTextDimmed: {
    opacity: 0.6,
  },
  fullWidthContainer: {
    width: "100%",
    flex: 1,
  },
  notificationSchedule: {
    width: "100%",
    flex: 1,
    minHeight: 200,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    minHeight: 50,
  },
  notificationLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: "white",
    opacity: 0.9,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: "white",
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
