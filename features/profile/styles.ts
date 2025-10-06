import { COLORS } from "@/shared/constants/COLORS";
import { CONTAINER } from "@/shared/constants/CONTAINER";
import { TYPOGRAPHY } from "@/shared/constants/TYPOGRAPHY";
import { StyleSheet } from "react-native";
import { generalStyles } from "../../shared/styles";

export const profileStyles = StyleSheet.create({
  container: {
    ...CONTAINER.basic.view,
  },
  uploadingImageOpacity: { ...CONTAINER.opacity.high },

  // Profile Header Section
  profileHeader: {
    ...CONTAINER.basic.centeredView,
    ...CONTAINER.padding.vertical["3xl"],
    ...CONTAINER.padding.horizontal["2xl"],
  },

  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3, // Increased to accommodate two rings
    borderColor: COLORS.primary, // Outer ring - primary color
    ...CONTAINER.margin.bottom.lg,
    overflow: "hidden",
  },

  profileImageInner: {
    width: "100%",
    height: "100%",
    borderRadius: 80, // Slightly smaller radius for inner content
    borderWidth: 3,
    borderColor: COLORS.light.background.primary, // Inner transparent ring
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  uploadingOverlay: {
    ...CONTAINER.layout.positioning.absolute.fill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },

  editPhotoText: {
    ...TYPOGRAPHY.heading.h3,
    ...generalStyles.textUppercase,
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  // Form Fields Section
  formSection: {
    ...CONTAINER.margin.bottom["3xl"],
    ...CONTAINER.gap.lg,
    ...CONTAINER.padding.horizontal["2xl"],
  },

  fieldContainer: {
    ...CONTAINER.margin.bottom["2xl"],
  },

  fieldLabel: {
    fontSize: 16,
    color: COLORS.textIcons,
    ...CONTAINER.margin.bottom.base,
    fontWeight: "400",
  },

  fieldValue: {
    fontSize: 16,
    color: COLORS.light.text.primary,
    textAlign: "right",
    fontWeight: "500",
  },

  fieldRow: {
    ...CONTAINER.basic.spaceBetween,
    ...CONTAINER.padding.vertical.lg,
    ...CONTAINER.border.bottom.thin,
    borderBottomColor: "#E5E5E5",
  },

  // Settings Sections
  settingsSection: {
    ...CONTAINER.margin.bottom["3xl"],
    ...CONTAINER.gap.lg,
    ...CONTAINER.padding.horizontal["2xl"],
  },

  sectionTitle: {
    fontSize: 12,
    color: COLORS.bodyText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  settingRow: {
    ...CONTAINER.basic.spaceBetween,
    ...CONTAINER.padding.vertical.lg,
    ...CONTAINER.border.bottom.thin,
    borderBottomColor: "#E5E5E5",
  },

  settingLabel: {
    fontSize: 16,
    color: COLORS.light.text.primary,
    fontWeight: "400",
  },

  settingValue: {
    ...CONTAINER.basic.row,
  },

  settingValueText: {
    fontSize: 16,
    color: COLORS.textIcons,
    fontWeight: "500",
    ...CONTAINER.margin.right.base,
  },

  chevronIcon: {
    color: COLORS.bodyText,
  },

  // Subscription Plan
  planContainer: {
    backgroundColor: "#F8F8F8",
    ...CONTAINER.border.radius.lg,
    ...CONTAINER.padding.xl,
    ...CONTAINER.margin.vertical.lg,
  },

  planHeader: {
    ...CONTAINER.basic.spaceBetween,
    ...CONTAINER.margin.bottom.lg,
  },

  planName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: "600",
    color: COLORS.light.text.primary,
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
    ...CONTAINER.margin.bottom.lg,
  },

  featuresList: {
    ...CONTAINER.margin.bottom.xl,
  },

  featureItem: {
    ...CONTAINER.layout.direction.row,
    alignItems: "flex-start",
    ...CONTAINER.margin.bottom.base,
  },

  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    ...CONTAINER.margin.right.md,
  },

  featureText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.light.text.primary,
    lineHeight: 20,
  },

  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    ...CONTAINER.border.radius.md,
    alignItems: "center",
  },

  upgradeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // Security Section
  securitySection: {
    ...CONTAINER.margin.bottom["3xl"],
  },

  dangerZone: {
    backgroundColor: "#FFF5F5",
    ...CONTAINER.border.radius.md,
    ...CONTAINER.padding.lg,
    ...CONTAINER.margin.top["2xl"],
  },

  dangerButton: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  // App Info
  appInfoSection: {
    ...CONTAINER.padding.top.lg,
    ...CONTAINER.padding.bottom["3xl"],
    ...CONTAINER.border.top.thin,
    borderTopColor: "#E5E5E5",
    ...CONTAINER.gap.lg,
  },

  appInfoRow: {
    ...CONTAINER.basic.spaceBetween,
    ...CONTAINER.padding.vertical.md,
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
    ...CONTAINER.padding.xl,
  },

  categorySelector: {
    ...CONTAINER.layout.direction.row,
    ...CONTAINER.margin.bottom.xl,
  },

  categoryButton: {
    flex: 1,
    ...CONTAINER.padding.vertical.md,
    ...CONTAINER.border.radius.md,
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
    ...CONTAINER.border.width.thin,
    borderColor: "#DDD",
    ...CONTAINER.border.radius.md,
    ...CONTAINER.padding.md,
    height: 120,
    textAlignVertical: "top",
    ...CONTAINER.margin.bottom.xl,
    fontSize: 16,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    ...CONTAINER.border.radius.md,
    alignItems: "center",
  },

  submitButtonDisabled: {
    ...CONTAINER.opacity.high,
  },

  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    ...CONTAINER.padding.vertical.lg,
    ...CONTAINER.border.top.thin,
    borderTopColor: "#E5E5E5",
  },

  // Error text for form validation
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    ...CONTAINER.margin.top.sm,
    ...CONTAINER.margin.bottom.base,
  },

  developerSection: {
    backgroundColor: "#F0F0F0",
    ...CONTAINER.border.radius["3xl"],
    alignItems: "center",
    ...CONTAINER.margin["2xl"],
  },
});
