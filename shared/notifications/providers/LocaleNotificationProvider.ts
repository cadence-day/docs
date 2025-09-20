import i18n from "@/shared/locales";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import {
  getRandomEveningReflection,
  getRandomMiddayReflection,
  getRandomStreakMessage,
} from "../cadenceMessages";
import {
  NotificationMessage,
  NotificationProvider,
  NotificationType,
} from "../types";

export interface LocalizedNotificationContent {
  title: string;
  body: string;
}

export interface NotificationTemplates {
  [key: string]: {
    title: string;
    body: string;
  };
}

export class LocaleNotificationProvider implements NotificationProvider {
  name = "LocaleNotificationProvider";
  private wrappedProvider: NotificationProvider;
  private templates: Map<string, NotificationTemplates> = new Map();

  constructor(wrappedProvider: NotificationProvider) {
    this.wrappedProvider = wrappedProvider;
    this.initializeTemplates();
  }

  async initialize(): Promise<void> {
    try {
      await this.wrappedProvider.initialize();
      GlobalErrorHandler.logDebug(
        "Locale notification provider initialized",
        "LocaleNotificationProvider.initialize",
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "LocaleNotificationProvider.initialize",
      );
      throw error;
    }
  }

  async sendNotification(notification: NotificationMessage): Promise<void> {
    try {
      const localizedNotification = this.localizeNotification(notification);
      await this.wrappedProvider.sendNotification(localizedNotification);
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "LocaleNotificationProvider.sendNotification",
        {
          notificationId: notification.id,
        },
      );
      throw error;
    }
  }

  async scheduleNotification(
    notification: NotificationMessage,
    scheduledFor: Date,
  ): Promise<void> {
    try {
      const localizedNotification = this.localizeNotification(notification);
      await this.wrappedProvider.scheduleNotification(
        localizedNotification,
        scheduledFor,
      );
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "LocaleNotificationProvider.scheduleNotification",
        {
          notificationId: notification.id,
          scheduledFor: scheduledFor.toISOString(),
        },
      );
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await this.wrappedProvider.cancelNotification(notificationId);
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "LocaleNotificationProvider.cancelNotification",
        {
          notificationId,
        },
      );
      throw error;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await this.wrappedProvider.cancelAllNotifications();
    } catch (error) {
      GlobalErrorHandler.logError(
        error,
        "LocaleNotificationProvider.cancelAllNotifications",
      );
      throw error;
    }
  }

  isSupported(): boolean {
    return this.wrappedProvider.isSupported();
  }

  // Locale-specific methods

  private localizeNotification(
    notification: NotificationMessage,
  ): NotificationMessage {
    try {
      // Get current language directly from i18n instance
      const currentLanguage = (i18n.language || "en").split(/[-_]/)[0]
        .toLowerCase();

      const localizedContent = this.getLocalizedContent(
        notification.type,
        currentLanguage,
        notification.metadata,
      );

      return {
        ...notification,
        title: localizedContent.title,
        body: localizedContent.body,
      };
    } catch (error) {
      GlobalErrorHandler.logWarning(
        "Failed to localize notification, using original content",
        "LocaleNotificationProvider.localizeNotification",
        { notificationId: notification.id },
      );
      return notification;
    }
  }

  private getLocalizedContent(
    type: NotificationType,
    language: string,
    metadata?: Record<string, any>,
  ): LocalizedNotificationContent {
    // For cadence-specific notifications, use the existing message system
    if (type === "midday-reflection") {
      return {
        title: this.getLocalizedTitle(
          "notifications.midday_reflection.title",
          language,
        ),
        body: getRandomMiddayReflection(),
      };
    }

    if (type === "evening-reflection") {
      return {
        title: this.getLocalizedTitle(
          "notifications.evening_reflection.title",
          language,
        ),
        body: getRandomEveningReflection(),
      };
    }

    if (type === "streak-reminder" && metadata?.streakCount) {
      return {
        title: this.getLocalizedTitle(
          "notifications.streak_reminder.title",
          language,
        ),
        body: getRandomStreakMessage(metadata.streakCount),
      };
    }

    // Use template system for other notification types
    const templates = this.templates.get(language) || this.templates.get("en");
    const template = templates?.[type];

    if (template) {
      return this.interpolateTemplate(template, metadata || {});
    }

    // Fallback to English or default content
    return {
      title: "Cadence Notification",
      body: "You have a new notification",
    };
  }

  private getLocalizedTitle(key: string, language: string): string {
    // This would ideally use the i18n system, but since we can't use hooks here,
    // we'll provide fallback titles for different languages
    const titles: Record<string, Record<string, string>> = {
      "notifications.midday_reflection.title": {
        en: "Midday Reflection",
        da: "Middag Reflektion",
        fr: "Réflexion de Midi",
        de: "Mittags-Reflektion",
        es: "Reflexión del Mediodía",
      },
      "notifications.evening_reflection.title": {
        en: "Evening Reflection",
        da: "Aften Reflektion",
        fr: "Réflexion du Soir",
        de: "Abend-Reflektion",
        es: "Reflexión Nocturna",
      },
      "notifications.streak_reminder.title": {
        en: "Weekly Progress",
        da: "Ugentlig Fremskridt",
        fr: "Progrès Hebdomadaire",
        de: "Wöchentlicher Fortschritt",
        es: "Progreso Semanal",
      },
    };

    return titles[key]?.[language] || titles[key]?.["en"] || key;
  }

  private interpolateTemplate(
    template: { title: string; body: string },
    variables: Record<string, any>,
  ): LocalizedNotificationContent {
    const interpolate = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key]?.toString() || match;
      });
    };

    return {
      title: interpolate(template.title),
      body: interpolate(template.body),
    };
  }

  private initializeTemplates(): void {
    // English templates
    this.templates.set("en", {
      achievement: {
        title: "Achievement Unlocked!",
        body: "Congratulations! You've earned: {{achievementName}}",
      },
      reminder: {
        title: "Friendly Reminder",
        body: "{{message}}",
      },
      system: {
        title: "System Notification",
        body: "{{message}}",
      },
    });

    // Danish templates
    this.templates.set("da", {
      achievement: {
        title: "Præstation Låst Op!",
        body: "Tillykke! Du har optjent: {{achievementName}}",
      },
      reminder: {
        title: "Venlig Påmindelse",
        body: "{{message}}",
      },
      system: {
        title: "Systemmeddelelse",
        body: "{{message}}",
      },
    });

    // French templates
    this.templates.set("fr", {
      achievement: {
        title: "Succès Débloqué !",
        body: "Félicitations ! Vous avez gagné : {{achievementName}}",
      },
      reminder: {
        title: "Rappel Amical",
        body: "{{message}}",
      },
      system: {
        title: "Notification Système",
        body: "{{message}}",
      },
    });

    // German templates
    this.templates.set("de", {
      achievement: {
        title: "Erfolg Freigeschaltet!",
        body: "Glückwunsch! Sie haben erhalten: {{achievementName}}",
      },
      reminder: {
        title: "Freundliche Erinnerung",
        body: "{{message}}",
      },
      system: {
        title: "Systembenachrichtigung",
        body: "{{message}}",
      },
    });

    // Spanish templates
    this.templates.set("es", {
      achievement: {
        title: "¡Logro Desbloqueado!",
        body: "¡Felicitaciones! Has ganado: {{achievementName}}",
      },
      reminder: {
        title: "Recordatorio Amistoso",
        body: "{{message}}",
      },
      system: {
        title: "Notificación del Sistema",
        body: "{{message}}",
      },
    });
  }

  // Method to add custom templates for a language
  addTemplates(language: string, templates: NotificationTemplates): void {
    const existingTemplates = this.templates.get(language) || {};
    this.templates.set(language, { ...existingTemplates, ...templates });
  }

  // Method to get supported languages
  getSupportedLanguages(): string[] {
    return Array.from(this.templates.keys());
  }

  // Static method to create cadence-specific notifications
  static createMiddayReflection(id: string): NotificationMessage {
    return {
      id,
      title: "Midday Reflection", // Will be localized
      body: getRandomMiddayReflection(),
      type: "midday-reflection",
    };
  }

  static createEveningReflection(id: string): NotificationMessage {
    return {
      id,
      title: "Evening Reflection", // Will be localized
      body: getRandomEveningReflection(),
      type: "evening-reflection",
    };
  }

  static createStreakReminder(
    id: string,
    streakCount: number,
  ): NotificationMessage {
    return {
      id,
      title: "Weekly Progress", // Will be localized
      body: getRandomStreakMessage(streakCount),
      type: "streak-reminder",
      metadata: { streakCount },
    };
  }
}
