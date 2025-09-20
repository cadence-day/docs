import { COLORS } from "@/shared/constants/COLORS";
import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Profile Header Section
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },

  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3, // Increased to accommodate two rings
    borderColor: COLORS.primary, // Outer ring - primary color
    marginBottom: 16,
    overflow: "hidden",
  },

  profileImageInner: {
    width: "100%",
    height: "100%",
    borderRadius: 80, // Slightly smaller radius for inner content
    borderWidth: 3,
    borderColor: COLORS.light.background, // Inner transparent ring
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },

  editPhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  editPhotoText: {
    color: COLORS.textIcons,
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Form Fields Section
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },

  fieldContainer: {
    marginBottom: 24,
  },

  fieldLabel: {
    fontSize: 16,
    color: COLORS.textIcons,
    marginBottom: 8,
    fontWeight: "400",
  },

  fieldValue: {
    fontSize: 16,
    color: COLORS.light.text,
    textAlign: "right",
    fontWeight: "500",
  },

  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  // Settings Sections
  settingsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 16,
  },

  sectionTitle: {
    fontSize: 12,
    color: COLORS.bodyText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },

  settingLabel: {
    fontSize: 16,
    color: COLORS.light.text,
    fontWeight: "400",
  },

  settingValue: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingValueText: {
    fontSize: 16,
    color: COLORS.textIcons,
    fontWeight: "500",
    marginRight: 8,
  },

  chevronIcon: {
    color: COLORS.bodyText,
  },

  // Subscription Plan
  planContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
  },

  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  planName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.light.text,
  },

  planPrice: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.primary,
  },

  planDescription: {
    fontSize: 14,
    color: COLORS.textIcons,
    lineHeight: 20,
    marginBottom: 16,
  },

  featuresList: {
    marginBottom: 20,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    marginRight: 12,
  },

  featureText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.light.text,
    lineHeight: 20,
  },

  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },

  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // Security Section
  securitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  dangerZone: {
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },

  dangerButton: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  // App Info
  appInfoSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 16,
  },

  appInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  appInfoLabel: {
    fontSize: 14,
    color: COLORS.textIcons,
  },

  appInfoValue: {
    fontSize: 14,
    color: COLORS.bodyText,
    fontFamily: "monospace",
  },

  // Support Form Styles
  supportFormContainer: {
    padding: 20,
  },

  categorySelector: {
    flexDirection: "row",
    marginBottom: 20,
  },

  categoryButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },

  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },

  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },

  categoryButtonTextActive: {
    color: COLORS.white,
  },

  messageInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    marginBottom: 20,
    fontSize: 16,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  submitButtonDisabled: {
    opacity: 0.5,
  },

  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },

  // Error text for form validation
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  developerSection: {
    backgroundColor: "#F0F0F0",
    borderRadius: 24,
    alignItems: "center",
    margin: 24,
  },
});
