import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import useDialogStore from "@/shared/stores/useDialogStore";
import { CdButton, CdText } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import useTranslation from "@/shared/hooks/useI18n";
import { useProfileStore } from "../stores/useProfileStore";
import { profileStyles } from "../styles";

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const openDialog = useDialogStore((s) => s.openDialog);
  const { profileData, settings, updateProfileData, updateSettings } = useProfileStore();

  const appVersion = Constants.expoConfig?.version || "Unknown";
  const buildNumber =
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.ios?.buildNumber ||
    // @ts-ignore - optional
    (Constants.expoConfig as any)?.android?.versionCode ||
    "Unknown";

  const onEditPhoto = () => {
    openDialog({
      type: "profile-image-picker",
      props: {
        currentImageUrl: user?.imageUrl ?? profileData.avatarUrl ?? null,
        onImageSelected: (url: string) => {
          updateProfileData({ avatarUrl: url });
        },
        height: 60,
        headerProps: { title: t("profile.edit-photo") },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  const handleTimePress = (type: 'wake' | 'sleep') => {
    openDialog({
      type: "time-picker",
      props: {
        mode: type,
        currentTime: type === 'wake' ? settings.wakeTime : settings.sleepTime,
        onTimeChange: (time: string) => {
          updateSettings({
            [type === 'wake' ? 'wakeTime' : 'sleepTime']: time
          });
        },
        height: 70,
        headerProps: { 
          title: type === 'wake' ? t("profile.set-wake-time") : t("profile.set-sleep-time") 
        },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  const handleNotificationsPress = () => {
    // TODO: Navigate to notifications screen in future iteration
    console.log('Notifications pressed - to be implemented');
  };

  const handleSubscriptionPress = () => {
    openDialog({
      type: "subscription-plans",
      props: {
        currentPlan: settings.subscriptionPlan,
        onPlanSelected: (plan: string) => {
          updateSettings({ subscriptionPlan: plan as any });
        },
        height: 80,
        headerProps: { title: t("profile.subscription-plan") },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  const handleSecurityPress = () => {
    // TODO: Navigate to security screen in future iteration
    console.log('Security pressed - to be implemented');
  };

  const handleSupportPress = () => {
    openDialog({
      type: "customer-support",
      props: {
        userId: user?.id,
        userEmail: user?.emailAddresses[0]?.emailAddress,
        appVersion,
        buildNumber,
        height: 70,
        headerProps: { title: t("profile.customer-support") },
      },
      position: "dock",
      viewSpecific: "profile",
    });
  };

  return (
    <ScrollView style={profileStyles.container}>
      {/* Profile Header */}
      <View style={profileStyles.profileHeader}>
        <TouchableOpacity 
          style={profileStyles.profileImageContainer}
          onPress={onEditPhoto}
          activeOpacity={0.8}
        >
          {(user?.imageUrl || profileData.avatarUrl) ? (
            <Image 
              source={{ uri: user?.imageUrl || profileData.avatarUrl }} 
              style={profileStyles.profileImage}
            />
          ) : (
            <View style={[profileStyles.profileImage, { 
              backgroundColor: '#F0F0F0',
              justifyContent: 'center',
              alignItems: 'center'
            }]}>
              <Ionicons 
                name="person" 
                size={40} 
                color={COLORS.textIcons} 
              />
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={profileStyles.editPhotoButton}
          onPress={onEditPhoto}
        >
          <Text style={profileStyles.editPhotoText}>
            {t("profile.edit-photo")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={profileStyles.formSection}>
        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t("profile.name")}</Text>
          <Text style={profileStyles.fieldValue}>
            {user?.fullName || profileData.name || "Your Name"}
          </Text>
        </View>
        
        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t("profile.username")}</Text>
          <Text style={profileStyles.fieldValue}>
            @{user?.username || profileData.username || "username"}
          </Text>
        </View>
        
        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t("profile.email")}</Text>
          <Text style={profileStyles.fieldValue}>
            {user?.emailAddresses[0]?.emailAddress || profileData.email || "email@example.com"}
          </Text>
        </View>
        
        {(user?.phoneNumbers?.[0]?.phoneNumber || profileData.phoneNumber) && (
          <View style={profileStyles.fieldRow}>
            <Text style={profileStyles.fieldLabel}>{t("profile.phone")}</Text>
            <Text style={profileStyles.fieldValue}>
              {user?.phoneNumbers?.[0]?.phoneNumber || profileData.phoneNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={profileStyles.settingsSection}>
        <TouchableOpacity 
          style={profileStyles.settingRow}
          onPress={handleNotificationsPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.notifications")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={profileStyles.settingRow}
          onPress={() => handleTimePress('wake')}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.wake-time")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.wakeTime}
            </Text>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={profileStyles.settingRow}
          onPress={() => handleTimePress('sleep')}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.sleep-time")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.sleepTime}
            </Text>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={profileStyles.settingRow}
          onPress={handleSubscriptionPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.subscription")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.subscriptionPlan === 'free' ? t("profile.free") : t("profile.deep-cadence")}
            </Text>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Security Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>
          {t("profile.security")}
        </Text>
        
        <TouchableOpacity 
          style={profileStyles.settingRow}
          onPress={handleSecurityPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.security-settings")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>
          {t("profile.support")}
        </Text>
        
        <TouchableOpacity 
          style={profileStyles.settingRow}
          onPress={handleSupportPress}
        >
          <Text style={profileStyles.settingLabel}>
            {t("profile.customer-support")}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={profileStyles.appInfoSection}>
        <Text style={profileStyles.sectionTitle}>
          {t("profile.app-info")}
        </Text>
        
        <View style={profileStyles.appInfoRow}>
          <Text style={profileStyles.appInfoLabel}>
            {t("profile.app-version")}
          </Text>
          <Text style={profileStyles.appInfoValue}>
            {appVersion} ({buildNumber})
          </Text>
        </View>
        
        <View style={profileStyles.appInfoRow}>
          <Text style={profileStyles.appInfoLabel}>
            {t("profile.user-id")}
          </Text>
          <Text style={profileStyles.appInfoValue}>
            {user?.id?.slice(-8) || 'Unknown'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

