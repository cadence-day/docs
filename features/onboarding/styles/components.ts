export const componentStyles = {
  // Button styles
  actionButton: {
    marginTop: 20,
    alignSelf: "center" as const,
    width: "100%",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500" as const,
  },
  notificationActionButton: {
    marginTop: 8,
    alignSelf: "center" as const,
    width: "100%",
  },
  linkButton: {
    marginTop: 62,
    width: 200,
  },

  // Activity picker styles
  activitiesContainer: {
    maxHeight: 200,
  },
  activitiesGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "flex-start" as const,
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
    fontWeight: "400" as const,
    letterSpacing: 0.98,
    textTransform: "uppercase" as const,
  },
  activityTagTextSelected: {
    fontWeight: "500" as const,
  },
  activityTagTextDimmed: {
    opacity: 0.6,
  },

  // Notification table styles
  notificationSchedule: {
    width: "100%",
    flex: 1,
    minHeight: 200,
  },
  notificationItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
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
    fontWeight: "bold" as const,
  },

  // Mood tracker styles
  moodTrackerPlaceholder: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    alignItems: "center" as const,
  },
  moodTrackerText: {
    color: "white",
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center" as const,
  },
};