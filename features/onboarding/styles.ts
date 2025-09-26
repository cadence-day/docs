import { StyleSheet } from "react-native";

export const onboardingStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    alignItems: "flex-start", // Align items to the left
    flex: 1,
    width: "60%", // Take up 60% of the parent container's width
    padding: 30,
    position: "relative",
  },
  contentContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 100,
  },
  embeddedContent: {
    flex: 1,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    width: "100%",
    marginBottom: 16,
  },
  spacer: {
    height: 12,
  },
  title: {
    fontSize: 18,
    color: "white",
    textAlign: "left",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 0,
    width: "60%",
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "500",
  },
  linkButton: {
    marginTop: 62,
    width: 200,
  },
  linkText: {
    color: "#FFFFFF",
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
  footerText: {
    fontSize: 14,
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
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 20,
  },
  subtitle: {
    fontSize: 12,
    color: "white",
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  activitiesContainer: {
    maxHeight: 200,
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
    color: "white",
    fontSize: 7,
    fontWeight: "400",
    letterSpacing: 0.98,
    textTransform: "uppercase",
  },
  activityTagTextSelected: {
    fontWeight: "500",
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
    fontSize: 16,
    color: "white",
    opacity: 0.9,
  },
  notificationTime: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
});
