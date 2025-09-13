# Profile Feature Styling Specifications

## Overview

Comprehensive styling specifications for the Profile feature, following the existing Cadence.day design system and React Native best practices. All styles are designed to be responsive, accessible, and consistent with the app's visual identity.

## Style Constants

### Color Usage

```typescript
import { COLORS } from "@/shared/constants/COLORS";

// Primary colors for the profile feature
const PROFILE_COLORS = {
  primary: COLORS.primary, // Purple accent (#6B73FF)
  secondary: COLORS.secondary, // Secondary accent
  background: {
    primary: COLORS.background.primary, // Main background
    secondary: COLORS.background.secondary, // Card backgrounds
    danger: "#FFF5F5", // Danger zone background
  },
  text: {
    primary: COLORS.text.primary, // Main text
    secondary: COLORS.text.secondary, // Labels
    tertiary: COLORS.text.tertiary, // Subtle text
    header: COLORS.text.header, // Section headers
  },
  border: {
    light: COLORS.separatorline.light, // Light borders
    primary: COLORS.primary, // Accent borders
  },
  status: {
    enabled: "#4CAF50", // Enabled/success state
    disabled: "#9E9E9E", // Disabled state
    danger: "#E53E3E", // Danger/delete actions
  },
};
```

## Main StyleSheet

```typescript
import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const profileStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background.primary,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  // Profile Header Section
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: PROFILE_COLORS.background.primary,
  },

  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: PROFILE_COLORS.primary,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: PROFILE_COLORS.background.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.background.secondary,
  },

  editPhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },

  editPhotoText: {
    color: PROFILE_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Form Fields Section
  formSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  fieldContainer: {
    marginBottom: 24,
  },

  fieldLabel: {
    fontSize: 16,
    color: PROFILE_COLORS.text.secondary,
    marginBottom: 8,
    fontWeight: "400",
  },

  fieldValue: {
    fontSize: 16,
    color: PROFILE_COLORS.text.primary,
    textAlign: "right",
    fontWeight: "500",
    flex: 1,
    marginLeft: 16,
  },

  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PROFILE_COLORS.border.light,
    minHeight: 56,
  },

  fieldRowFirst: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PROFILE_COLORS.border.light,
  },

  // Settings Sections
  settingsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 12,
    color: PROFILE_COLORS.text.tertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 8,
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PROFILE_COLORS.border.light,
    minHeight: 56,
    backgroundColor: "transparent",
    borderRadius: 0,
  },

  settingRowPressed: {
    backgroundColor: "rgba(107, 115, 255, 0.05)",
  },

  settingLabel: {
    fontSize: 16,
    color: PROFILE_COLORS.text.primary,
    fontWeight: "400",
    flex: 1,
  },

  settingValue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  settingValueText: {
    fontSize: 16,
    color: PROFILE_COLORS.text.secondary,
    fontWeight: "500",
    marginRight: 8,
    textAlign: "right",
  },

  chevronIcon: {
    color: PROFILE_COLORS.text.tertiary,
    marginLeft: 4,
  },

  // Status Indicators
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },

  statusBadgeEnabled: {
    backgroundColor: PROFILE_COLORS.status.enabled,
  },

  statusBadgeDisabled: {
    backgroundColor: PROFILE_COLORS.status.disabled,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },

  // Time Picker Styles
  timePickerContainer: {
    backgroundColor: PROFILE_COLORS.background.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  timePickerHeader: {
    alignItems: "center",
    marginBottom: 32,
  },

  timePickerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: PROFILE_COLORS.text.primary,
    marginBottom: 8,
  },

  timePickerSubtitle: {
    fontSize: 14,
    color: PROFILE_COLORS.text.secondary,
  },

  timePickerWheel: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },

  timeColumn: {
    width: 80,
    height: 200,
    justifyContent: "center",
  },

  timeColumnSeparator: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  timeColumnSeparatorText: {
    fontSize: 24,
    fontWeight: "600",
    color: PROFILE_COLORS.text.primary,
  },

  timePickerValue: {
    fontSize: 18,
    fontWeight: "500",
    color: PROFILE_COLORS.text.primary,
    textAlign: "center",
    paddingVertical: 8,
  },

  timePickerValueSelected: {
    fontSize: 22,
    fontWeight: "600",
    color: PROFILE_COLORS.primary,
    backgroundColor: "rgba(107, 115, 255, 0.1)",
    borderRadius: 8,
  },

  // Subscription Plan Styles
  planContainer: {
    backgroundColor: PROFILE_COLORS.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },

  planContainerSelected: {
    borderColor: PROFILE_COLORS.primary,
    shadowColor: PROFILE_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    color: PROFILE_COLORS.text.primary,
  },

  planPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: PROFILE_COLORS.primary,
  },

  planDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },

  featuresHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: PROFILE_COLORS.text.primary,
    marginBottom: 12,
  },

  featuresList: {
    marginBottom: 20,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 4,
  },

  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PROFILE_COLORS.primary,
    marginTop: 7,
    marginRight: 12,
    flexShrink: 0,
  },

  featureText: {
    flex: 1,
    fontSize: 14,
    color: PROFILE_COLORS.text.primary,
    lineHeight: 20,
  },

  upgradeButton: {
    backgroundColor: PROFILE_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  upgradeButtonDisabled: {
    backgroundColor: PROFILE_COLORS.status.disabled,
    opacity: 0.6,
  },

  upgradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  currentPlanBadge: {
    backgroundColor: PROFILE_COLORS.status.enabled,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },

  currentPlanText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Security Section Styles
  securitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  securityFeature: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PROFILE_COLORS.border.light,
  },

  securityFeatureLabel: {
    fontSize: 16,
    color: PROFILE_COLORS.text.primary,
    fontWeight: "400",
    flex: 1,
  },

  securityFeatureStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  dangerZone: {
    backgroundColor: PROFILE_COLORS.background.danger,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(229, 62, 62, 0.2)",
  },

  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: PROFILE_COLORS.status.danger,
    marginBottom: 8,
  },

  dangerZoneDescription: {
    fontSize: 14,
    color: PROFILE_COLORS.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  dangerButton: {
    backgroundColor: PROFILE_COLORS.status.danger,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center",
  },

  dangerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // App Information Section
  appInfoSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PROFILE_COLORS.border.light,
    backgroundColor: PROFILE_COLORS.background.primary,
  },

  appInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },

  appInfoLabel: {
    fontSize: 14,
    color: PROFILE_COLORS.text.secondary,
    fontWeight: "400",
  },

  appInfoValue: {
    fontSize: 14,
    color: PROFILE_COLORS.text.tertiary,
    fontFamily: "monospace",
    fontWeight: "500",
  },

  // Customer Support Styles
  supportContainer: {
    padding: 20,
    maxHeight: "80%",
  },

  supportCategorySelector: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border.light,
  },

  supportCategoryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: PROFILE_COLORS.background.secondary,
    alignItems: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: PROFILE_COLORS.border.light,
  },

  supportCategoryButtonLast: {
    borderRightWidth: 0,
  },

  supportCategoryButtonSelected: {
    backgroundColor: PROFILE_COLORS.primary,
  },

  supportCategoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: PROFILE_COLORS.text.primary,
  },

  supportCategoryTextSelected: {
    color: "#fff",
  },

  supportMessageInput: {
    borderWidth: 1,
    borderColor: PROFILE_COLORS.border.light,
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
    color: PROFILE_COLORS.text.primary,
    backgroundColor: PROFILE_COLORS.background.primary,
    marginBottom: 20,
  },

  supportSubmitButton: {
    backgroundColor: PROFILE_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },

  supportSubmitButtonDisabled: {
    opacity: 0.5,
  },

  supportSubmitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Accessibility & Responsive Styles
  touchableArea: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  accessibleRow: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 4,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },

  loadingText: {
    fontSize: 16,
    color: PROFILE_COLORS.text.secondary,
    marginTop: 16,
    textAlign: "center",
  },

  // Error States
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: "rgba(229, 62, 62, 0.2)",
  },

  errorText: {
    color: PROFILE_COLORS.status.danger,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
```

## Responsive Design Considerations

### Screen Size Adaptations

```typescript
import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const getResponsiveStyles = () => {
  const isTablet = screenWidth >= 768;
  const isSmallScreen = screenWidth < 375;

  return StyleSheet.create({
    // Tablet adjustments
    containerTablet: {
      maxWidth: isTablet ? 600 : "100%",
      alignSelf: "center",
    },

    // Small screen adjustments
    profileImageSmall: {
      width: isSmallScreen ? 100 : 120,
      height: isSmallScreen ? 100 : 120,
      borderRadius: isSmallScreen ? 50 : 60,
    },

    // Dynamic padding based on screen width
    sectionPadding: {
      paddingHorizontal: Math.max(16, screenWidth * 0.06),
    },
  });
};
```

## Dark Mode Support

```typescript
import { useColorScheme } from "react-native";

export const getDarkModeStyles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return StyleSheet.create({
    containerDark: {
      backgroundColor: isDark ? "#1A1A1A" : PROFILE_COLORS.background.primary,
    },

    textDark: {
      color: isDark ? "#FFFFFF" : PROFILE_COLORS.text.primary,
    },

    secondaryTextDark: {
      color: isDark ? "#B0B0B0" : PROFILE_COLORS.text.secondary,
    },

    borderDark: {
      borderColor: isDark ? "#333333" : PROFILE_COLORS.border.light,
    },
  });
};
```

## Animation Styles

```typescript
export const animationStyles = StyleSheet.create({
  fadeIn: {
    opacity: 0,
  },

  slideInFromRight: {
    transform: [{ translateX: screenWidth }],
  },

  scaleUp: {
    transform: [{ scale: 0.9 }],
  },

  rotateIcon: {
    transform: [{ rotate: "0deg" }],
  },
});
```

## Usage Examples

### Profile Screen Implementation

```typescript
import { profileStyles, getResponsiveStyles } from '../styles';

const ProfileScreen = () => {
  const responsiveStyles = getResponsiveStyles();

  return (
    <ScrollView style={[profileStyles.container, responsiveStyles.containerTablet]}>
      <View style={profileStyles.profileHeader}>
        <TouchableOpacity style={profileStyles.profileImageContainer}>
          {/* Profile image content */}
        </TouchableOpacity>
      </View>
      {/* Rest of component */}
    </ScrollView>
  );
};
```

### Time Picker Dialog

```typescript
const TimePickerDialog = () => {
  return (
    <View style={profileStyles.timePickerContainer}>
      <View style={profileStyles.timePickerHeader}>
        <Text style={profileStyles.timePickerTitle}>Set Wake Time</Text>
      </View>
      <View style={profileStyles.timePickerWheel}>
        {/* Time picker content */}
      </View>
    </View>
  );
};
```

## Accessibility Guidelines

### Touch Targets

- Minimum 44x44pt touch areas
- Adequate spacing between interactive elements
- Clear visual feedback on press

### Text & Contrast

- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Support for dynamic type sizing

### Screen Reader Support

- Proper semantic structure
- Descriptive accessibility labels
- Logical reading order

## Platform-Specific Considerations

### iOS Specific

- Use of native iOS design patterns
- Support for haptic feedback
- Integration with iOS accessibility features

### Android Specific

- Material Design principles where appropriate
- Support for Android accessibility services
- Proper elevation and shadows

This styling specification provides a comprehensive foundation for implementing the profile feature with consistent, accessible, and responsive design patterns.
