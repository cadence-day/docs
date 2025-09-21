# Profile Feature Edge Cases & Error Handling

## Overview

This document outlines comprehensive edge cases, error scenarios, and handling strategies for the Profile feature to ensure robust and reliable user experience across all possible conditions.

## Time Management Edge Cases

### 1. Cross-Midnight Sleep Schedules

**Scenario**: User sleeps at 02:00 and wakes at 10:00

```typescript
interface CrossMidnightCase {
  sleepTime: "02:00";
  wakeTime: "10:00";
  expectedDuration: 8; // hours
}

// Edge Case Handling
export const handleCrossMidnightSleep = (
  sleepTime: string,
  wakeTime: string
) => {
  const sleepHour = parseInt(sleepTime.split(":")[0]);
  const wakeHour = parseInt(wakeTime.split(":")[0]);

  // Normalize hours for calculation
  const normalizedSleepHour = sleepHour < 12 ? sleepHour + 24 : sleepHour;
  const normalizedWakeHour = wakeHour < 12 ? wakeHour + 24 : wakeHour;

  // Handle wrap-around
  if (normalizedSleepHour > normalizedWakeHour) {
    const duration = 24 - (normalizedSleepHour - 24) + wakeHour;
    return {
      isValid: duration >= 4 && duration <= 12,
      duration,
      warning: duration < 6 ? "Short sleep duration" : null,
    };
  }

  return { isValid: true, duration: normalizedWakeHour - normalizedSleepHour };
};
```

**Mitigation Strategy**:

- Normalize time calculations to handle 24-hour wrap-around
- Display clear warnings for unusual sleep patterns
- Provide visual timeline to help users understand their schedule

### 2. Invalid Time Ranges

**Scenario**: Wake time occurs before sleep time on same day

```typescript
interface InvalidTimeRange {
  sleepTime: "23:30";
  wakeTime: "22:00"; // Invalid - wake before sleep
}

export const validateTimeRange = (
  sleepTime: string,
  wakeTime: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const sleepMinutes = timeToMinutes(sleepTime);
    const wakeMinutes = timeToMinutes(wakeTime);

    // Check for same time
    if (sleepMinutes === wakeMinutes) {
      errors.push("Sleep and wake times cannot be the same");
    }

    // Calculate duration considering cross-midnight
    const duration = calculateSleepDuration(sleepTime, wakeTime);

    if (duration < 3) {
      errors.push("Sleep duration must be at least 3 hours");
    } else if (duration < 6) {
      warnings.push("Sleep duration is quite short (less than 6 hours)");
    }

    if (duration > 14) {
      errors.push("Sleep duration cannot exceed 14 hours");
    } else if (duration > 10) {
      warnings.push("Sleep duration is quite long (more than 10 hours)");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      calculatedDuration: duration,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ["Invalid time format"],
      warnings: [],
      calculatedDuration: 0,
    };
  }
};

const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time format");
  }
  return hours * 60 + minutes;
};
```

**Mitigation Strategy**:

- Real-time validation with clear error messages
- Suggestion system for reasonable time ranges
- Auto-correction for obvious mistakes

### 3. Timezone Changes During Travel

**Scenario**: User travels across timezones while app is in use

```typescript
interface TimezoneChange {
  originalTimezone: string;
  newTimezone: string;
  timeOffset: number; // hours difference
}

export class TimezoneHandler {
  static detectTimezoneChange(): TimezoneChange | null {
    const storedTimezone = LocalStorage.get("user_timezone");
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (storedTimezone && storedTimezone !== currentTimezone) {
      const offset = this.calculateTimezoneOffset(
        storedTimezone,
        currentTimezone
      );
      return {
        originalTimezone: storedTimezone,
        newTimezone: currentTimezone,
        timeOffset: offset,
      };
    }

    return null;
  }

  static async handleTimezoneChange(change: TimezoneChange) {
    try {
      // Notify user of timezone change
      const shouldAdjust = await this.promptUserForAdjustment(change);

      if (shouldAdjust) {
        await this.adjustTimesForTimezone(change);
      }

      // Update stored timezone
      LocalStorage.set("user_timezone", change.newTimezone);
    } catch (error) {
      GlobalErrorHandler.logError(error, "TIMEZONE_ADJUSTMENT_FAILED", {
        originalTimezone: change.originalTimezone,
        newTimezone: change.newTimezone,
      });
    }
  }

  private static async promptUserForAdjustment(
    change: TimezoneChange
  ): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Timezone Change Detected",
        `Your timezone changed from ${change.originalTimezone} to ${change.newTimezone}. ` +
          `Would you like to adjust your sleep/wake times by ${Math.abs(change.timeOffset)} hours?`,
        [
          { text: "No", onPress: () => resolve(false) },
          { text: "Yes", onPress: () => resolve(true) },
        ]
      );
    });
  }

  private static async adjustTimesForTimezone(change: TimezoneChange) {
    const profileStore = useProfileStore.getState();
    const { settings } = profileStore;

    const adjustedWakeTime = this.adjustTime(
      settings.wakeTime,
      change.timeOffset
    );
    const adjustedSleepTime = this.adjustTime(
      settings.sleepTime,
      change.timeOffset
    );

    await profileStore.updateSettings({
      ...settings,
      wakeTime: adjustedWakeTime,
      sleepTime: adjustedSleepTime,
    });
  }

  private static adjustTime(timeStr: string, offsetHours: number): string {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const adjustedHours = (hours + offsetHours + 24) % 24;
    return `${adjustedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}
```

**Mitigation Strategy**:

- Automatic timezone detection
- User confirmation before adjusting times
- Graceful handling of timezone data unavailability

### 4. DST Transitions

**Scenario**: Daylight Saving Time changes affect stored times

```typescript
export class DSTHandler {
  static async checkForDSTTransition() {
    const lastCheck = LocalStorage.get("last_dst_check");
    const now = new Date();

    // Only check once per day
    if (lastCheck && isSameDay(new Date(lastCheck), now)) {
      return;
    }

    try {
      const isDSTNow = this.isDSTActive();
      const wasDSTActive = LocalStorage.get("dst_active") === "true";

      if (isDSTNow !== wasDSTActive) {
        await this.handleDSTTransition(isDSTNow);
        LocalStorage.set("dst_active", isDSTNow.toString());
      }

      LocalStorage.set("last_dst_check", now.toISOString());
    } catch (error) {
      GlobalErrorHandler.logError(error, "DST_CHECK_FAILED");
    }
  }

  private static isDSTActive(): boolean {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);

    const stdTimezoneOffset = Math.max(
      january.getTimezoneOffset(),
      july.getTimezoneOffset()
    );
    return now.getTimezoneOffset() < stdTimezoneOffset;
  }

  private static async handleDSTTransition(isDSTNow: boolean) {
    const message = isDSTNow
      ? "Daylight Saving Time has started. Your sleep schedule may be affected."
      : "Daylight Saving Time has ended. Your sleep schedule may be affected.";

    Alert.alert(
      "Time Change Notice",
      message + " Would you like to review your sleep/wake times?",
      [
        { text: "Later", style: "cancel" },
        { text: "Review Now", onPress: () => router.push("/profile") },
      ]
    );
  }
}
```

**Mitigation Strategy**:

- Automatic DST detection
- User notification of potential impacts
- Optional time adjustment recommendations

## Profile Data Edge Cases

### 1. Clerk User Data Sync Failures

**Scenario**: Network issues prevent Clerk data synchronization

```typescript
export class ClerkSyncHandler {
  private static readonly SYNC_RETRY_ATTEMPTS = 3;
  private static readonly SYNC_RETRY_DELAY = 2000; // 2 seconds

  static async syncWithRetry(
    maxRetries = this.SYNC_RETRY_ATTEMPTS
  ): Promise<SyncResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.performSync();

        if (result.success) {
          // Clear any previous sync errors
          this.clearSyncError();
          return result;
        }

        lastError = new Error(result.error || "Sync failed");
      } catch (error) {
        lastError = error as Error;

        GlobalErrorHandler.logError(error, "CLERK_SYNC_ATTEMPT_FAILED", {
          attempt,
          maxRetries,
          errorMessage: (error as Error).message,
        });

        // Don't retry on authentication errors
        if (this.isAuthError(error)) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          await this.delay(this.SYNC_RETRY_DELAY * Math.pow(2, attempt - 1));
        }
      }
    }

    // All retries failed
    this.handleSyncFailure(lastError);
    return {
      success: false,
      error: lastError?.message || "Sync failed after multiple attempts",
      fallbackToLocal: true,
    };
  }

  private static async performSync(): Promise<SyncResult> {
    const { user } = useAuth();

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Check network connectivity
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw new Error("No network connection");
    }

    const profileStore = useProfileStore.getState();

    // Sync user data from Clerk
    const syncedData = {
      name: user.fullName || "",
      username: user.username || "",
      email: user.emailAddresses[0]?.emailAddress || "",
      phoneNumber: user.phoneNumbers[0]?.phoneNumber || "",
      avatarUrl: user.imageUrl || "",
    };

    profileStore.updateProfileData(syncedData);

    return { success: true, data: syncedData };
  }

  private static isAuthError(error: any): boolean {
    return (
      error?.status === 401 ||
      error?.code === "session_expired" ||
      error?.message?.includes("authentication")
    );
  }

  private static handleSyncFailure(error: Error | null) {
    const profileStore = useProfileStore.getState();

    // Enable offline mode
    profileStore.updateSettings({
      ...profileStore.settings,
      isOfflineMode: true,
    });

    // Show user-friendly message
    Alert.alert(
      "Sync Issue",
      "Unable to sync your profile data. You can continue using the app with cached data.",
      [{ text: "OK" }]
    );
  }

  private static clearSyncError() {
    const profileStore = useProfileStore.getState();
    profileStore.clearError();

    // Disable offline mode if it was enabled
    if (profileStore.settings.isOfflineMode) {
      profileStore.updateSettings({
        ...profileStore.settings,
        isOfflineMode: false,
      });
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

**Mitigation Strategy**:

- Retry mechanism with exponential backoff
- Graceful fallback to local data
- Clear user communication about sync status

### 2. Image Upload Failures

**Scenario**: Profile image upload fails due to network or server issues

```typescript
export class ImageUploadHandler {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "webp"];
  private static readonly UPLOAD_TIMEOUT = 30000; // 30 seconds

  static async uploadProfileImage(imageUri: string): Promise<UploadResult> {
    try {
      // Validate image before upload
      const validation = await this.validateImage(imageUri);
      if (!validation.isValid) {
        return { success: false, error: validation.error! };
      }

      // Compress image if needed
      const processedImage = await this.processImage(imageUri);

      // Upload with retry mechanism
      const uploadResult = await this.uploadWithRetry(processedImage);

      if (uploadResult.success) {
        // Cache successful upload locally
        await this.cacheImageLocally(imageUri, uploadResult.url!);
      }

      return uploadResult;
    } catch (error) {
      GlobalErrorHandler.logError(error, "IMAGE_UPLOAD_FAILED", {
        imageUri: imageUri.substring(0, 50) + "...", // Don't log full URI
      });

      return {
        success: false,
        error: "Image upload failed. Please try again.",
        canRetry: true,
      };
    }
  }

  private static async validateImage(
    imageUri: string
  ): Promise<ValidationResult> {
    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        return { isValid: false, error: "Selected image file not found" };
      }

      // Check file size
      if (fileInfo.size && fileInfo.size > this.MAX_FILE_SIZE) {
        return {
          isValid: false,
          error: `Image is too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
      }

      // Check file format
      const extension = imageUri.split(".").pop()?.toLowerCase();
      if (!extension || !this.SUPPORTED_FORMATS.includes(extension)) {
        return {
          isValid: false,
          error: `Unsupported image format. Supported formats: ${this.SUPPORTED_FORMATS.join(", ")}`,
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: "Unable to validate image file",
      };
    }
  }

  private static async processImage(imageUri: string): Promise<string> {
    try {
      // Compress and resize image
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 400, height: 400 } }, // Standardize size
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return processedImage.uri;
    } catch (error) {
      GlobalErrorHandler.logError(error, "IMAGE_PROCESSING_FAILED");
      // Return original if processing fails
      return imageUri;
    }
  }

  private static async uploadWithRetry(
    imageUri: string,
    maxRetries = 3
  ): Promise<UploadResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.performUpload(imageUri);
        return { success: true, url: result.url };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (this.isClientError(error)) {
          break;
        }

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt); // Progressive delay
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Upload failed",
      canRetry: !this.isClientError(lastError),
    };
  }

  private static async performUpload(
    imageUri: string
  ): Promise<{ url: string }> {
    // This would integrate with Clerk's image upload API
    // For now, simulate the upload process

    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile-image.jpg",
    } as any);

    const response = await fetch("/api/upload-profile-image", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: this.UPLOAD_TIMEOUT,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    return { url: result.imageUrl };
  }

  private static isClientError(error: any): boolean {
    return error?.status >= 400 && error?.status < 500;
  }

  private static async cacheImageLocally(
    originalUri: string,
    uploadedUrl: string
  ) {
    try {
      LocalStorage.set("profile_image_cache", {
        originalUri,
        uploadedUrl,
        cachedAt: new Date().toISOString(),
      });
    } catch (error) {
      // Non-critical error, just log it
      GlobalErrorHandler.logError(error, "IMAGE_CACHE_FAILED");
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

**Mitigation Strategy**:

- Comprehensive image validation
- Automatic compression and resizing
- Retry mechanism with smart error handling
- Local caching for resilience

## Subscription Edge Cases

### 1. Failed Payment Recovery

**Scenario**: User's payment method fails during subscription renewal

```typescript
export class SubscriptionRecoveryHandler {
  static async handlePaymentFailure(
    subscriptionId: string,
    error: PaymentError
  ) {
    try {
      const recovery = await this.createRecoveryPlan(error);
      await this.notifyUser(recovery);
      await this.applyGracePeriod(subscriptionId);
    } catch (recoveryError) {
      GlobalErrorHandler.logError(
        recoveryError,
        "SUBSCRIPTION_RECOVERY_FAILED",
        {
          subscriptionId,
          originalError: error.message,
        }
      );

      await this.fallbackToFreeTier(subscriptionId);
    }
  }

  private static async createRecoveryPlan(
    error: PaymentError
  ): Promise<RecoveryPlan> {
    const strategies: RecoveryStrategy[] = [];

    if (error.code === "card_declined") {
      strategies.push({
        type: "update_payment_method",
        title: "Update Payment Method",
        description:
          "Your card was declined. Please update your payment information.",
        action: () => router.push("/profile/billing/payment-methods"),
      });
    }

    if (error.code === "insufficient_funds") {
      strategies.push({
        type: "retry_later",
        title: "Retry Payment",
        description:
          "We'll try again in 3 days. Ensure sufficient funds are available.",
        action: () => this.scheduleRetry(3),
      });
    }

    // Always offer downgrade option
    strategies.push({
      type: "downgrade",
      title: "Continue with Free Plan",
      description: "Switch to the free plan to continue using basic features.",
      action: () => this.downgradeToPlan("free"),
    });

    return {
      error,
      strategies,
      gracePeriodDays: 7,
      createdAt: new Date().toISOString(),
    };
  }

  private static async applyGracePeriod(subscriptionId: string) {
    const profileStore = useProfileStore.getState();
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

    profileStore.updateSettings({
      ...profileStore.settings,
      subscriptionStatus: "grace_period",
      gracePeriodEnd: gracePeriodEnd.toISOString(),
    });
  }

  private static async fallbackToFreeTier(subscriptionId: string) {
    const profileStore = useProfileStore.getState();

    profileStore.updateSettings({
      ...profileStore.settings,
      subscriptionPlan: "free",
      subscriptionStatus: "active",
    });

    Alert.alert(
      "Subscription Issue",
      "Due to payment issues, your account has been switched to the free plan. Premium features are no longer available.",
      [{ text: "OK" }]
    );
  }
}
```

**Mitigation Strategy**:

- Grace period for payment resolution
- Multiple recovery strategies
- Graceful downgrade to free tier
- Clear user communication

### 2. Plan Changes Mid-Cycle

**Scenario**: User upgrades/downgrades subscription in the middle of billing cycle

```typescript
export class PlanChangeHandler {
  static async handleMidCyclePlanChange(
    currentPlan: string,
    newPlan: string,
    billingCycleStart: Date
  ): Promise<PlanChangeResult> {
    try {
      const prorationCalculation = this.calculateProration(
        currentPlan,
        newPlan,
        billingCycleStart
      );

      // Show user the proration details
      const userApproval = await this.getUserApproval(prorationCalculation);
      if (!userApproval) {
        return { success: false, reason: "User cancelled" };
      }

      // Process the change
      const result = await this.processPlanChange(
        newPlan,
        prorationCalculation
      );

      if (result.success) {
        await this.updateLocalSubscription(newPlan, result.effectiveDate);
        await this.logPlanChange(currentPlan, newPlan, prorationCalculation);
      }

      return result;
    } catch (error) {
      GlobalErrorHandler.logError(error, "PLAN_CHANGE_FAILED", {
        currentPlan,
        newPlan,
      });

      return {
        success: false,
        reason: "Plan change failed. Please try again later.",
      };
    }
  }

  private static calculateProration(
    currentPlan: string,
    newPlan: string,
    billingCycleStart: Date
  ): ProrationDetails {
    const planPrices = { free: 0, deep_cadence: 5.99 };
    const currentPrice = planPrices[currentPlan] || 0;
    const newPrice = planPrices[newPlan] || 0;

    const now = new Date();
    const cycleEnd = new Date(billingCycleStart);
    cycleEnd.setMonth(cycleEnd.getMonth() + 1);

    const daysInCycle = Math.ceil(
      (cycleEnd.getTime() - billingCycleStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.ceil(
      (cycleEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dailyCurrentRate = currentPrice / daysInCycle;
    const dailyNewRate = newPrice / daysInCycle;

    const refundAmount = dailyCurrentRate * daysRemaining;
    const chargeAmount = dailyNewRate * daysRemaining;
    const netAmount = chargeAmount - refundAmount;

    return {
      currentPlan,
      newPlan,
      daysRemaining,
      refundAmount: Math.max(0, refundAmount),
      chargeAmount: Math.max(0, chargeAmount),
      netAmount,
      effectiveDate: now.toISOString(),
    };
  }

  private static async getUserApproval(
    proration: ProrationDetails
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const message = this.formatProrationMessage(proration);

      Alert.alert("Plan Change Confirmation", message, [
        { text: "Cancel", onPress: () => resolve(false) },
        { text: "Confirm", onPress: () => resolve(true) },
      ]);
    });
  }

  private static formatProrationMessage(proration: ProrationDetails): string {
    if (proration.netAmount === 0) {
      return `Your plan will change immediately at no additional cost.`;
    } else if (proration.netAmount > 0) {
      return `You will be charged $${proration.netAmount.toFixed(2)} for the remaining ${proration.daysRemaining} days of this billing cycle.`;
    } else {
      return `You will receive a credit of $${Math.abs(proration.netAmount).toFixed(2)} for the remaining ${proration.daysRemaining} days.`;
    }
  }
}
```

**Mitigation Strategy**:

- Transparent proration calculations
- User confirmation for all changes
- Detailed change logging
- Rollback capability

## Activity Suggestion Edge Cases

### 1. No Persona Detected

**Scenario**: System cannot determine user persona from available data

```typescript
export class PersonaFallbackHandler {
  static async handleUnknownPersona(
    wakeTime: string,
    sleepTime: string,
    userPreferences?: Partial<UserPreferences>
  ): Promise<PersonaFallbackResult> {
    try {
      // Try alternative persona detection methods
      const fallbackPersona = await this.detectPersonaFallback(
        wakeTime,
        sleepTime,
        userPreferences
      );

      if (fallbackPersona) {
        return {
          success: true,
          persona: fallbackPersona,
          confidence: 0.4, // Lower confidence for fallback
          method: "fallback_detection",
        };
      }

      // Use generic suggestions if all else fails
      const genericSuggestions = this.getGenericSuggestions();

      return {
        success: true,
        persona: {
          type: "flexible",
          suggestedActivities: genericSuggestions,
          locale: "en-US",
          confidence: 0.3,
        },
        confidence: 0.3,
        method: "generic_fallback",
      };
    } catch (error) {
      GlobalErrorHandler.logError(error, "PERSONA_FALLBACK_FAILED");

      return {
        success: false,
        error: "Unable to generate activity suggestions",
      };
    }
  }

  private static async detectPersonaFallback(
    wakeTime: string,
    sleepTime: string,
    userPreferences?: Partial<UserPreferences>
  ): Promise<UserPersona | null> {
    // Method 1: Use user preferences if available
    if (userPreferences?.preferredActivityTypes) {
      return this.inferPersonaFromPreferences(userPreferences);
    }

    // Method 2: Use time patterns with relaxed rules
    const wakeHour = parseInt(wakeTime.split(":")[0]);

    if (wakeHour <= 7) {
      return {
        type: "early_bird",
        suggestedActivities: [],
        locale: "en-US",
        confidence: 0.4,
      };
    } else if (wakeHour >= 9) {
      return {
        type: "night_owl",
        suggestedActivities: [],
        locale: "en-US",
        confidence: 0.4,
      };
    }

    return null;
  }

  private static getGenericSuggestions(): string[] {
    return [
      "Exercise",
      "Reading",
      "Meditation",
      "Social Time",
      "Learning",
      "Hobbies",
      "Self Care",
      "Planning",
    ];
  }
}
```

**Mitigation Strategy**:

- Multiple fallback detection methods
- Generic activity suggestions as last resort
- Clear indication of confidence levels
- User preference learning over time

## Security & Privacy Edge Cases

### 1. Biometric Authentication Failures

**Scenario**: Touch ID/Face ID fails or is unavailable

```typescript
export class BiometricFallbackHandler {
  static async handleBiometricFailure(
    error: BiometricError,
    context: "login" | "sensitive_action"
  ): Promise<AuthResult> {
    try {
      const fallbackOptions = await this.determineFallbackOptions(error);
      const userChoice = await this.presentFallbackOptions(
        fallbackOptions,
        context
      );

      return await this.executeFallback(userChoice);
    } catch (fallbackError) {
      GlobalErrorHandler.logError(fallbackError, "BIOMETRIC_FALLBACK_FAILED", {
        originalError: error.message,
        context,
      });

      return { success: false, requiresManualAuth: true };
    }
  }

  private static async determineFallbackOptions(
    error: BiometricError
  ): Promise<FallbackOption[]> {
    const options: FallbackOption[] = [];

    // Check if passcode is available
    const hasPasscode =
      (await LocalAuthentication.hasHardwareAsync()) &&
      (await LocalAuthentication.isEnrolledAsync());

    if (hasPasscode && error.code !== "BiometricUnavailable") {
      options.push({
        type: "device_passcode",
        title: "Use Device Passcode",
        description: "Enter your device passcode to continue",
      });
    }

    // Always offer app-specific PIN as fallback
    options.push({
      type: "app_pin",
      title: "Use App PIN",
      description: "Enter your 6-digit app PIN",
    });

    // Emergency bypass option
    if (error.code === "BiometricLockout") {
      options.push({
        type: "emergency_bypass",
        title: "Emergency Access",
        description: "Answer security questions to bypass biometric lock",
      });
    }

    return options;
  }

  private static async presentFallbackOptions(
    options: FallbackOption[],
    context: string
  ): Promise<FallbackOption> {
    return new Promise((resolve, reject) => {
      const buttons = options.map((option) => ({
        text: option.title,
        onPress: () => resolve(option),
      }));

      buttons.push({
        text: "Cancel",
        style: "cancel",
        onPress: () => reject(new Error("User cancelled authentication")),
      });

      Alert.alert(
        "Authentication Required",
        `Biometric authentication failed. Please choose an alternative method to ${context}.`,
        buttons
      );
    });
  }
}
```

**Mitigation Strategy**:

- Multiple authentication fallback methods
- Clear error communication
- Emergency access procedures
- Graceful degradation of features

## Technical Edge Cases

### 1. Dialog Registry Conflicts

**Scenario**: Multiple dialogs with same ID or memory leaks

```typescript
export class DialogRegistryManager {
  private static registeredDialogs = new Map<string, DialogComponent>();
  private static activeDialogs = new Set<string>();

  static register(id: string, component: DialogComponent): void {
    // Check for conflicts
    if (this.registeredDialogs.has(id)) {
      GlobalErrorHandler.logError(
        new Error(`Dialog ID conflict: ${id} already registered`),
        "DIALOG_REGISTRY_CONFLICT",
        { dialogId: id }
      );

      // Allow override with warning in development
      if (__DEV__) {
        console.warn(`Overriding existing dialog: ${id}`);
      } else {
        throw new Error(`Dialog ID conflict: ${id}`);
      }
    }

    this.registeredDialogs.set(id, component);
  }

  static show(id: string, props?: any): void {
    const component = this.registeredDialogs.get(id);

    if (!component) {
      GlobalErrorHandler.logError(
        new Error(`Dialog not found: ${id}`),
        "DIALOG_NOT_FOUND",
        {
          dialogId: id,
          availableDialogs: Array.from(this.registeredDialogs.keys()),
        }
      );
      return;
    }

    // Prevent duplicate dialogs
    if (this.activeDialogs.has(id)) {
      console.warn(`Dialog ${id} is already active`);
      return;
    }

    this.activeDialogs.add(id);

    // Set cleanup timeout to prevent memory leaks
    this.setCleanupTimeout(id);

    // Show the dialog
    // Implementation depends on your dialog system
  }

  static hide(id?: string): void {
    if (id) {
      this.activeDialogs.delete(id);
    } else {
      // Hide all dialogs
      this.activeDialogs.clear();
    }
  }

  private static setCleanupTimeout(id: string): void {
    setTimeout(() => {
      if (this.activeDialogs.has(id)) {
        console.warn(
          `Dialog ${id} was not properly cleaned up, forcing cleanup`
        );
        this.activeDialogs.delete(id);
      }
    }, 300000); // 5 minutes timeout
  }

  static cleanup(): void {
    this.activeDialogs.clear();
    // Additional cleanup logic
  }
}
```

**Mitigation Strategy**:

- Unique ID enforcement
- Active dialog tracking
- Automatic cleanup mechanisms
- Memory leak prevention

### 2. Storage Quota Exceeded

**Scenario**: Device storage full, preventing data persistence

```typescript
export class StorageQuotaHandler {
  private static readonly CRITICAL_STORAGE_THRESHOLD = 50 * 1024 * 1024; // 50MB
  private static readonly WARNING_STORAGE_THRESHOLD = 100 * 1024 * 1024; // 100MB

  static async checkStorageQuota(): Promise<StorageStatus> {
    try {
      const freeSpace = await FileSystem.getFreeDiskStorageAsync();

      if (freeSpace < this.CRITICAL_STORAGE_THRESHOLD) {
        return { status: "critical", freeSpace };
      } else if (freeSpace < this.WARNING_STORAGE_THRESHOLD) {
        return { status: "warning", freeSpace };
      }

      return { status: "ok", freeSpace };
    } catch (error) {
      GlobalErrorHandler.logError(error, "STORAGE_CHECK_FAILED");
      return { status: "unknown", freeSpace: 0 };
    }
  }

  static async handleLowStorage(status: StorageStatus): Promise<void> {
    if (status.status === "critical") {
      await this.criticalStorageCleanup();

      Alert.alert(
        "Storage Full",
        "Your device is running out of storage. Some features may not work properly.",
        [
          { text: "OK" },
          { text: "Free Up Space", onPress: () => this.openStorageSettings() },
        ]
      );
    } else if (status.status === "warning") {
      Alert.alert(
        "Low Storage",
        "Your device is running low on storage. Consider freeing up space.",
        [{ text: "OK" }]
      );
    }
  }

  private static async criticalStorageCleanup(): Promise<void> {
    try {
      // Clean up temporary files
      await this.cleanTempFiles();

      // Compress stored data
      await this.compressStoredData();

      // Remove old cached images
      await this.cleanImageCache();
    } catch (error) {
      GlobalErrorHandler.logError(error, "STORAGE_CLEANUP_FAILED");
    }
  }

  private static async cleanTempFiles(): Promise<void> {
    const tempDir = `${FileSystem.cacheDirectory}temp/`;
    const tempFiles = await FileSystem.readDirectoryAsync(tempDir).catch(
      () => []
    );

    for (const file of tempFiles) {
      try {
        await FileSystem.deleteAsync(`${tempDir}${file}`);
      } catch (error) {
        // Individual file cleanup failures are non-critical
      }
    }
  }
}
```

**Mitigation Strategy**:

- Proactive storage monitoring
- Automatic cleanup mechanisms
- Data compression strategies
- User guidance for storage management

This comprehensive edge case documentation ensures robust error handling and graceful degradation across all possible failure scenarios in the Profile feature.
