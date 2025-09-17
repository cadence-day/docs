# Profile Feature Implementation Guide

## Technical Implementation Details

This document provides comprehensive implementation guidance for the Profile feature, including Clerk integration, dialog system setup, and component architecture.

## Prerequisites

### Dependencies

```json
{
  "@clerk/clerk-expo": "^1.0.0",
  "expo-router": "^3.0.0",
  "expo-image-picker": "^14.0.0",
  "expo-constants": "^15.0.0",
  "@sentry/react-native": "^5.0.0",
  "zustand": "^4.0.0"
}
```

### Environment Setup

```typescript
// shared/constants/SECRETS.ts
export const SECRETS = {
  CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  // Add other environment variables
};
```

## Core Implementation

### 1. Profile Store Implementation

```typescript
// features/profile/stores/useProfileStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProfileFormData, ProfileSettings } from "../types";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";

interface ProfileStore {
  // State
  profileData: ProfileFormData;
  settings: ProfileSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  updateProfileData: (data: Partial<ProfileFormData>) => void;
  updateSettings: (settings: Partial<ProfileSettings>) => void;
  syncWithClerk: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultProfileData: ProfileFormData = {
  name: "",
  username: "",
  email: "",
  phoneNumber: "",
  avatarUrl: "",
};

const defaultSettings: ProfileSettings = {
  wakeTime: "07:30",
  sleepTime: "23:30",
  notifications: {
    morningReminders: true,
    eveningReminders: false,
    weeklyStreaks: true,
  },
  subscriptionPlan: "free",
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      profileData: defaultProfileData,
      settings: defaultSettings,
      isLoading: false,
      error: null,

      // Actions
      updateProfileData: (data) => {
        set((state) => ({
          profileData: { ...state.profileData, ...data },
          error: null,
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          error: null,
        }));
      },

      syncWithClerk: async () => {
        set({ isLoading: true, error: null });

        try {
          // This will be implemented when Clerk integration is active
          // For now, we'll just simulate the sync
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // TODO: Implement actual Clerk sync
          // const { user } = useAuth();
          // if (user) {
          //   set((state) => ({
          //     profileData: {
          //       ...state.profileData,
          //       name: user.fullName || '',
          //       username: user.username || '',
          //       email: user.emailAddresses[0]?.emailAddress || '',
          //       avatarUrl: user.imageUrl || '',
          //     }
          //   }));
          // }
        } catch (error) {
          const errorMessage = "Failed to sync profile data";
          GlobalErrorHandler.logError(error, "PROFILE_SYNC_FAILED");
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          profileData: defaultProfileData,
          settings: defaultSettings,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "profile-store",
      partialize: (state) => ({
        profileData: state.profileData,
        settings: state.settings,
      }),
    }
  )
);
```

### 2. Main Profile Screen Component

```typescript
// features/profile/components/ProfileScreen.tsx
import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';

import { CdDialog } from '@/shared/components/dialogs';
import { useI18n } from '@/shared/hooks/useI18n';
import { useProfileStore } from '../stores/useProfileStore';
import { profileStyles } from '../styles';
import { COLORS } from '@/shared/constants/COLORS';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';

export const ProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { t } = useI18n();
  const {
    profileData,
    settings,
    updateProfileData,
    updateSettings,
    syncWithClerk,
    isLoading,
    error,
    clearError
  } = useProfileStore();

  // App metadata
  const appVersion = Constants.expoConfig?.version || 'Unknown';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ||
                     Constants.expoConfig?.android?.versionCode || 'Unknown';

  // Sync with Clerk on mount
  useEffect(() => {
    if (user) {
      syncWithClerk();
    }
  }, [user]);

  // Handle profile photo edit
  const handleEditPhoto = () => {
    CdDialog.show('profileImagePicker', {
      currentImageUrl: profileData.avatarUrl,
      onImageSelected: async (imageUrl: string) => {
        try {
          updateProfileData({ avatarUrl: imageUrl });

          // TODO: Upload to Clerk when integration is ready
          // await user?.setProfileImage({ file: imageUrl });

        } catch (error) {
          GlobalErrorHandler.logError(error, 'PROFILE_IMAGE_UPDATE_FAILED', {
            userId: user?.id,
          });
          Alert.alert(t('error'), t('profile.image-update-failed'));
        }
      }
    });
  };

  // Handle time selection
  const handleTimePress = (type: 'wake' | 'sleep') => {
    CdDialog.show('timePicker', {
      mode: type,
      currentTime: type === 'wake' ? settings.wakeTime : settings.sleepTime,
      onTimeChange: (time: string) => {
        const newSettings = {
          ...settings,
          [type === 'wake' ? 'wakeTime' : 'sleepTime']: time
        };
        updateSettings(newSettings);

        // Trigger rest activity creation/update
        // This will be handled by the ActivitySuggestionService
      }
    });
  };

  // Handle notifications navigation
  const handleNotificationsPress = () => {
    router.push('/profile/notifications');
  };

  // Handle subscription management
  const handleSubscriptionPress = () => {
    CdDialog.show('subscriptionPlans', {
      currentPlan: settings.subscriptionPlan,
      onPlanSelected: async (plan: string) => {
        try {
          // TODO: Integrate with Clerk billing
          // For now, just update local state
          updateSettings({ ...settings, subscriptionPlan: plan as any });

          // Future implementation:
          // await clerk.billing.createSubscription({
          //   planId: plan,
          //   userId: user?.id,
          // });

        } catch (error) {
          GlobalErrorHandler.logError(error, 'SUBSCRIPTION_UPDATE_FAILED', {
            userId: user?.id,
            targetPlan: plan,
          });
          Alert.alert(t('error'), t('profile.subscription-update-failed'));
        }
      }
    });
  };

  // Handle security settings
  const handleSecurityPress = () => {
    router.push('/profile/security');
  };

  // Handle customer support
  const handleSupportPress = () => {
    CdDialog.show('customerSupport', {
      userId: user?.id,
      userEmail: user?.emailAddresses[0]?.emailAddress,
      appVersion,
      buildNumber
    });
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.delete-account'),
      t('profile.delete-account-warning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement account deletion with Clerk
              // await user?.delete();
              await signOut();
              router.replace('/auth/sign-in');
            } catch (error) {
              GlobalErrorHandler.logError(error, 'ACCOUNT_DELETION_FAILED', {
                userId: user?.id,
              });
              Alert.alert(t('error'), t('profile.deletion-failed'));
            }
          }
        }
      ]
    );
  };

  // Error display
  if (error) {
    return (
      <View style={profileStyles.errorContainer}>
        <Text style={profileStyles.errorText}>{error}</Text>
        <TouchableOpacity onPress={clearError}>
          <Text style={profileStyles.upgradeButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={profileStyles.loadingContainer}>
        <Text style={profileStyles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container} contentContainerStyle={profileStyles.scrollContainer}>
      {/* Profile Header */}
      <View style={profileStyles.profileHeader}>
        <TouchableOpacity
          style={profileStyles.profileImageContainer}
          onPress={handleEditPhoto}
          activeOpacity={0.8}
          accessibilityLabel={t('profile.edit-photo')}
          accessibilityRole="button"
        >
          {(user?.imageUrl || profileData.avatarUrl) ? (
            <Image
              source={{ uri: user?.imageUrl || profileData.avatarUrl }}
              style={profileStyles.profileImage}
            />
          ) : (
            <View style={profileStyles.profileImagePlaceholder}>
              <Ionicons
                name="person"
                size={40}
                color={COLORS.text.tertiary}
              />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={profileStyles.editPhotoButton}
          onPress={handleEditPhoto}
          accessibilityLabel={t('profile.edit-photo')}
          accessibilityRole="button"
        >
          <Text style={profileStyles.editPhotoText}>
            {t('profile.edit-photo')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={profileStyles.formSection}>
        <View style={[profileStyles.fieldRow, profileStyles.fieldRowFirst]}>
          <Text style={profileStyles.fieldLabel}>{t('profile.name')}</Text>
          <Text style={profileStyles.fieldValue}>
            {user?.fullName || profileData.name || t('profile.not-set')}
          </Text>
        </View>

        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t('profile.username')}</Text>
          <Text style={profileStyles.fieldValue}>
            @{user?.username || profileData.username || t('profile.not-set')}
          </Text>
        </View>

        <View style={profileStyles.fieldRow}>
          <Text style={profileStyles.fieldLabel}>{t('profile.email')}</Text>
          <Text style={profileStyles.fieldValue} numberOfLines={1}>
            {user?.emailAddresses[0]?.emailAddress || profileData.email || t('profile.not-set')}
          </Text>
        </View>

        {(user?.phoneNumbers?.[0]?.phoneNumber || profileData.phoneNumber) && (
          <View style={profileStyles.fieldRow}>
            <Text style={profileStyles.fieldLabel}>{t('profile.phone')}</Text>
            <Text style={profileStyles.fieldValue}>
              {user?.phoneNumbers[0]?.phoneNumber || profileData.phoneNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Settings Section */}
      <View style={profileStyles.settingsSection}>
        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={handleNotificationsPress}
          accessibilityLabel={t('profile.notifications')}
          accessibilityRole="button"
        >
          <Text style={profileStyles.settingLabel}>
            {t('profile.notifications')}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={() => handleTimePress('wake')}
          accessibilityLabel={`${t('profile.wake-time')}: ${settings.wakeTime}`}
          accessibilityRole="button"
        >
          <Text style={profileStyles.settingLabel}>
            {t('profile.wake-time')}
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
          accessibilityLabel={`${t('profile.sleep-time')}: ${settings.sleepTime}`}
          accessibilityRole="button"
        >
          <Text style={profileStyles.settingLabel}>
            {t('profile.sleep-time')}
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
          accessibilityLabel={`${t('profile.subscription')}: ${settings.subscriptionPlan}`}
          accessibilityRole="button"
        >
          <Text style={profileStyles.settingLabel}>
            {t('profile.subscription')}
          </Text>
          <View style={profileStyles.settingValue}>
            <Text style={profileStyles.settingValueText}>
              {settings.subscriptionPlan === 'free' ? t('profile.free') : t('profile.deep-cadence')}
            </Text>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Security Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>
          {t('profile.security')}
        </Text>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={handleSecurityPress}
          accessibilityLabel={t('profile.security-settings')}
          accessibilityRole="button"
        >
          <Text style={profileStyles.settingLabel}>
            {t('profile.security-settings')}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={profileStyles.settingsSection}>
        <Text style={profileStyles.sectionTitle}>
          {t('profile.support')}
        </Text>

        <TouchableOpacity
          style={profileStyles.settingRow}
          onPress={handleSupportPress}
          accessibilityLabel={t('profile.customer-support')}
          accessibilityRole="button"
        >
          <Text style={profileStyles.settingLabel}>
            {t('profile.customer-support')}
          </Text>
          <View style={profileStyles.settingValue}>
            <Ionicons name="chevron-forward" size={16} style={profileStyles.chevronIcon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={profileStyles.appInfoSection}>
        <Text style={profileStyles.sectionTitle}>
          {t('profile.app-info')}
        </Text>

        <View style={profileStyles.appInfoRow}>
          <Text style={profileStyles.appInfoLabel}>
            {t('profile.app-version')}
          </Text>
          <Text style={profileStyles.appInfoValue}>
            {appVersion} ({buildNumber})
          </Text>
        </View>

        <View style={profileStyles.appInfoRow}>
          <Text style={profileStyles.appInfoLabel}>
            {t('profile.user-id')}
          </Text>
          <Text style={profileStyles.appInfoValue}>
            {user?.id?.slice(-8) || 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={profileStyles.dangerZone}>
        <Text style={profileStyles.dangerZoneTitle}>
          {t('profile.danger-zone')}
        </Text>
        <Text style={profileStyles.dangerZoneDescription}>
          {t('profile.delete-account-description')}
        </Text>
        <TouchableOpacity
          style={profileStyles.dangerButton}
          onPress={handleDeleteAccount}
          accessibilityLabel={t('profile.delete-account')}
          accessibilityRole="button"
        >
          <Text style={profileStyles.dangerButtonText}>
            {t('profile.delete-account')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
```

### 3. Dialog System Integration

```typescript
// features/profile/dialogs/index.ts
import { CdDialog } from "@/shared/components/dialogs";
import { ProfileImagePickerDialog } from "./ProfileImagePickerDialog";
import { TimePickerDialog } from "./TimePickerDialog";
import { SubscriptionPlansDialog } from "./SubscriptionPlansDialog";
import { CustomerSupportDialog } from "./CustomerSupportDialog";

// Register profile dialogs
export const registerProfileDialogs = () => {
  CdDialog.register("profileImagePicker", ProfileImagePickerDialog);
  CdDialog.register("timePicker", TimePickerDialog);
  CdDialog.register("subscriptionPlans", SubscriptionPlansDialog);
  CdDialog.register("customerSupport", CustomerSupportDialog);
};
```

### 4. Time Picker Dialog Implementation

```typescript
// features/profile/dialogs/TimePickerDialog.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { CdDialog } from '@/shared/components/dialogs';
import { useI18n } from '@/shared/hooks/useI18n';
import { profileStyles } from '../styles';
import { Ionicons } from '@expo/vector-icons';

interface TimePickerDialogProps {
  mode: 'wake' | 'sleep';
  currentTime: string;
  onTimeChange: (time: string) => void;
}

const { height: screenHeight } = Dimensions.get('window');

export const TimePickerDialog: React.FC<TimePickerDialogProps> = ({
  mode,
  currentTime,
  onTimeChange
}) => {
  const { t } = useI18n();
  const [hours, minutes] = currentTime.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(hours);
  const [selectedMinute, setSelectedMinute] = useState(minutes);

  // Generate time options
  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = useCallback(() => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onTimeChange(timeString);
    CdDialog.hide();
  }, [selectedHour, selectedMinute, onTimeChange]);

  const renderTimeColumn = (
    options: number[],
    selectedValue: number,
    onSelect: (value: number) => void,
    suffix?: string
  ) => (
    <ScrollView
      style={profileStyles.timeColumn}
      showsVerticalScrollIndicator={false}
      snapToInterval={40}
      decelerationRate="fast"
    >
      {options.map((value) => (
        <TouchableOpacity
          key={value}
          style={{
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 12,
          }}
          onPress={() => onSelect(value)}
        >
          <Text
            style={[
              profileStyles.timePickerValue,
              selectedValue === value && profileStyles.timePickerValueSelected,
            ]}
          >
            {value.toString().padStart(2, '0')}{suffix}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <CdDialog.Container
      title={mode === 'wake' ? t('profile.set-wake-time') : t('profile.set-sleep-time')}
      maxHeight={screenHeight * 0.7}
    >
      <View style={profileStyles.timePickerContainer}>
        <View style={profileStyles.timePickerHeader}>
          <Text style={profileStyles.timePickerTitle}>
            {mode === 'wake' ? t('profile.wake-time') : t('profile.sleep-time')}
          </Text>
          <Text style={profileStyles.timePickerSubtitle}>
            {t('profile.time-picker-subtitle')}
          </Text>
        </View>

        <View style={profileStyles.timePickerWheel}>
          {renderTimeColumn(hourOptions, selectedHour, setSelectedHour)}

          <View style={profileStyles.timeColumnSeparator}>
            <Text style={profileStyles.timeColumnSeparatorText}>:</Text>
          </View>

          {renderTimeColumn(minuteOptions, selectedMinute, setSelectedMinute)}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 32 }}>
          <TouchableOpacity
            style={[profileStyles.upgradeButton, { backgroundColor: '#6B7280', flex: 0.45 }]}
            onPress={() => CdDialog.hide()}
          >
            <Text style={profileStyles.upgradeButtonText}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[profileStyles.upgradeButton, { flex: 0.45 }]}
            onPress={handleConfirm}
          >
            <Text style={profileStyles.upgradeButtonText}>
              {t('common.confirm')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </CdDialog.Container>
  );
};
```

### 5. Customer Support Dialog with Sentry Integration

```typescript
// features/profile/dialogs/CustomerSupportDialog.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { CdDialog } from '@/shared/components/dialogs';
import { useI18n } from '@/shared/hooks/useI18n';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';
import { profileStyles } from '../styles';

interface CustomerSupportDialogProps {
  userId?: string;
  userEmail?: string;
  appVersion: string;
  buildNumber: string;
}

type SupportCategory = 'general' | 'bug' | 'feature';

export const CustomerSupportDialog: React.FC<CustomerSupportDialogProps> = ({
  userId,
  userEmail,
  appVersion,
  buildNumber
}) => {
  const { t } = useI18n();
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<SupportCategory>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert(t('error'), t('profile.support.message-required'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Create comprehensive Sentry context
      Sentry.withScope((scope) => {
        scope.setTag('support_request', true);
        scope.setTag('category', category);
        scope.setLevel('info');

        // User context
        scope.setUser({
          id: userId,
          email: userEmail,
        });

        // App context
        scope.setContext('app_info', {
          version: appVersion,
          buildNumber,
          platform: 'mobile',
        });

        // Support request context
        scope.setContext('support_request', {
          category,
          message: message.trim(),
          timestamp: new Date().toISOString(),
        });

        // Device context (if available)
        scope.setContext('device_info', {
          // Add device-specific information
          userAgent: 'React Native',
        });

        Sentry.captureMessage(`Support Request: ${category}`, 'info');
      });

      // Also log to our error handler for internal tracking
      GlobalErrorHandler.logError(
        new Error(`Support request: ${category}`),
        'CUSTOMER_SUPPORT_REQUEST',
        {
          userId,
          email: userEmail,
          message: message.trim(),
          category,
          appVersion,
          buildNumber,
          platform: 'mobile',
        }
      );

      // Show success message
      Alert.alert(
        t('profile.support.success'),
        t('profile.support.success-message'),
        [{
          text: t('common.ok'),
          onPress: () => {
            CdDialog.hide();
            setMessage('');
            setCategory('general');
          }
        }]
      );

    } catch (error) {
      GlobalErrorHandler.logError(error, 'SUPPORT_REQUEST_FAILED', {
        userId,
        category,
        messageLength: message.length
      });
      Alert.alert(t('error'), t('profile.support.error-message'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { key: SupportCategory; label: string }[] = [
    { key: 'general', label: t('profile.support.general') },
    { key: 'bug', label: t('profile.support.bug') },
    { key: 'feature', label: t('profile.support.feature') },
  ];

  return (
    <CdDialog.Container title={t('profile.customer-support')}>
      <ScrollView style={profileStyles.supportContainer}>
        <Text style={profileStyles.fieldLabel}>
          {t('profile.support.category')}
        </Text>

        <View style={profileStyles.supportCategorySelector}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                profileStyles.supportCategoryButton,
                index === categories.length - 1 && profileStyles.supportCategoryButtonLast,
                category === cat.key && profileStyles.supportCategoryButtonSelected,
              ]}
              onPress={() => setCategory(cat.key)}
              accessibilityLabel={cat.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: category === cat.key }}
            >
              <Text style={[
                profileStyles.supportCategoryText,
                category === cat.key && profileStyles.supportCategoryTextSelected,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={profileStyles.fieldLabel}>
          {t('profile.support.message')}
        </Text>

        <TextInput
          style={profileStyles.supportMessageInput}
          multiline
          placeholder={t('profile.support.message-placeholder')}
          value={message}
          onChangeText={setMessage}
          maxLength={1000}
          accessibilityLabel={t('profile.support.message')}
          accessibilityHint={t('profile.support.message-hint')}
        />

        <Text style={[profileStyles.appInfoLabel, { textAlign: 'right', marginBottom: 20 }]}>
          {message.length}/1000
        </Text>

        <TouchableOpacity
          style={[
            profileStyles.supportSubmitButton,
            isSubmitting && profileStyles.supportSubmitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !message.trim()}
          accessibilityLabel={t('profile.support.submit')}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting || !message.trim() }}
        >
          <Text style={profileStyles.supportSubmitButtonText}>
            {isSubmitting ? t('common.submitting') : t('profile.support.submit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </CdDialog.Container>
  );
};
```

## Integration Steps

### 1. App Setup

```typescript
// app/_layout.tsx
import { ClerkProvider } from '@clerk/clerk-expo';
import { registerProfileDialogs } from '@/features/profile/dialogs';
import { SECRETS } from '@/shared/constants/SECRETS';

export default function RootLayout() {
  // Register dialogs on app start
  React.useEffect(() => {
    registerProfileDialogs();
  }, []);

  return (
    <ClerkProvider publishableKey={SECRETS.CLERK_PUBLISHABLE_KEY}>
      {/* Rest of app */}
    </ClerkProvider>
  );
}
```

### 2. Route Setup

```typescript
// app/(home)/profile.tsx
import { ProfileScreen } from '@/features/profile/components/ProfileScreen';

export default function ProfileRoute() {
  return <ProfileScreen />;
}
```

### 3. Clerk Configuration

```typescript
// shared/auth/clerkConfig.ts
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export { tokenCache };
```

## Testing Considerations

### Unit Tests

```typescript
// features/profile/__tests__/ProfileScreen.test.tsx
import { render, fireEvent } from "@testing-library/react-native";
import { ProfileScreen } from "../components/ProfileScreen";

describe("ProfileScreen", () => {
  it("renders profile information correctly", () => {
    // Test implementation
  });

  it("handles time picker correctly", () => {
    // Test implementation
  });

  it("submits support requests properly", () => {
    // Test implementation
  });
});
```

### Integration Tests

```typescript
// features/profile/__tests__/profileStore.test.ts
import { useProfileStore } from "../stores/useProfileStore";

describe("ProfileStore", () => {
  it("syncs with Clerk correctly", async () => {
    // Test implementation
  });

  it("handles errors gracefully", async () => {
    // Test implementation
  });
});
```

## Performance Optimizations

### Lazy Loading

```typescript
// Lazy load dialog components
const TimePickerDialog = React.lazy(() => import("./TimePickerDialog"));
const SubscriptionPlansDialog = React.lazy(
  () => import("./SubscriptionPlansDialog")
);
```

### Memoization

```typescript
// Memoize expensive computations
const ProfileScreen = React.memo(() => {
  // Component implementation
});
```

### Image Optimization

```typescript
// Optimize profile images
import { Image } from 'expo-image';

const ProfileImage = ({ uri }: { uri: string }) => (
  <Image
    source={{ uri }}
    style={profileStyles.profileImage}
    contentFit="cover"
    transition={200}
    cachePolicy="memory-disk"
  />
);
```

This implementation guide provides a comprehensive foundation for building the Profile feature with proper integration patterns, error handling, and performance considerations.
