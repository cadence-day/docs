export const layoutStyles = {
  // Main layout containers
  container: {
    marginTop: 20,
    alignItems: "flex-start" as const,
    flex: 1,
    width: "60%",
    padding: 30,
    position: "relative" as const,
  },
  contentContainer: {
    flex: 1,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
    marginTop: 100,
  },
  screenContainer: {
    flex: 1,
    alignItems: "flex-start" as const,
    justifyContent: "flex-start" as const,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 20,
  },
  textContainer: {
    width: "100%",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 0,
    width: "60%",
    marginBottom: 8,
  },
  embeddedContent: {
    flex: 1,
    marginTop: 20,
    alignItems: "flex-start" as const,
    justifyContent: "center" as const,
    width: "100%",
  },
  childrenContainer: {
    flex: 1,
    marginTop: 20,
    alignItems: "flex-start" as const,
    justifyContent: "center" as const,
    width: "100%",
  },
  fullWidthContainer: {
    width: "100%",
    flex: 1,
  },
  spacer: {
    height: 12,
  },
};