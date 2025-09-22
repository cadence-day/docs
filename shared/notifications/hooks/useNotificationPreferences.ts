import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationPreferences } from '../types';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';

const PREFERENCES_KEY = 'CADENCE_NOTIFICATION_PREFERENCES';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  rhythm: 'both',
  middayTime: '12:00',
  eveningTimeStart: '18:00',
  eveningTimeEnd: '21:00',
  streaksEnabled: true,
  lightTouch: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      } else {
        setPreferences(DEFAULT_PREFERENCES);
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      }
    } catch (error) {
      GlobalErrorHandler.logError(error, 'useNotificationPreferences.loadPreferences');
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences } as NotificationPreferences;
      setPreferences(updated);
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));

      GlobalErrorHandler.logDebug(
        'Preferences saved',
        'useNotificationPreferences.updatePreferences',
        updated
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, 'useNotificationPreferences.updatePreferences');
      throw error;
    }
  };

  const resetPreferences = async () => {
    try {
      setPreferences(DEFAULT_PREFERENCES);
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(DEFAULT_PREFERENCES));

      GlobalErrorHandler.logDebug(
        'Preferences reset to defaults',
        'useNotificationPreferences.resetPreferences'
      );
    } catch (error) {
      GlobalErrorHandler.logError(error, 'useNotificationPreferences.resetPreferences');
      throw error;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    resetPreferences,
  };
}