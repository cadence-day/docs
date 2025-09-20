import {
  NotificationProvider,
  NotificationMessage,
  NotificationEvent,
  NotificationSubscriber,
  NotificationEngineConfig,
  NotificationLog,
  NotificationType,
  NotificationDeliveryMethod,
  NotificationPreferences
} from './types';
import { GlobalErrorHandler } from '@/shared/utils/errorHandler';

export class NotificationEngine {
  private providers: Map<NotificationDeliveryMethod, NotificationProvider> = new Map();
  private subscribers: NotificationSubscriber[] = [];
  private config: NotificationEngineConfig;
  private logs: NotificationLog[] = [];

  constructor(config: NotificationEngineConfig) {
    this.config = config;
  }

  registerProvider(method: NotificationDeliveryMethod, provider: NotificationProvider): void {
    if (!this.config.enabledProviders.includes(method)) {
      if (this.config.enableLogging) {
        GlobalErrorHandler.logWarning(`Provider ${method} is not enabled in config`, 'NotificationEngine.registerProvider');
      }
      return;
    }

    this.providers.set(method, provider);
    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(`Registered provider: ${provider.name} for ${method}`, 'NotificationEngine.registerProvider');
    }
  }

  subscribe(subscriber: NotificationSubscriber): () => void {
    this.subscribers.push(subscriber);
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  async initialize(): Promise<void> {
    const initPromises = Array.from(this.providers.values()).map(provider =>
      provider.initialize().catch(error => {
        GlobalErrorHandler.logError(error, 'NotificationEngine.initialize', { providerName: provider.name });
      })
    );

    await Promise.allSettled(initPromises);

    if (this.config.enableLogging) {
      GlobalErrorHandler.logDebug(`Initialized with ${this.providers.size} providers`, 'NotificationEngine.initialize');
    }
  }

  async emit(event: NotificationEvent): Promise<void> {
    const deliveryPromises = event.deliveryMethod
      .map(async (method) => {
        const provider = this.providers.get(method);
        if (!provider) {
          if (this.config.enableLogging) {
            GlobalErrorHandler.logWarning(`No provider found for method: ${method}`, 'NotificationEngine.emit');
          }
          return;
        }

        if (!provider.isSupported()) {
          if (this.config.enableLogging) {
            GlobalErrorHandler.logWarning(`Provider ${provider.name} is not supported`, 'NotificationEngine.emit');
          }
          return;
        }

        try {
          await provider.sendNotification(event.message);
          this.logNotification(event.userId || 'unknown', event.type, method, 'sent');
          this.notifySubscribers('onNotificationSent', event.message);
        } catch (error) {
          this.logNotification(event.userId || 'unknown', event.type, method, 'failed', error as Error);
          this.notifySubscribers('onNotificationFailed', event.message, error as Error);
        }
      });

    await Promise.allSettled(deliveryPromises);
  }

  async schedule(
    event: NotificationEvent,
    scheduledFor: Date,
    userId?: string
  ): Promise<void> {
    const schedulePromises = event.deliveryMethod
      .map(async (method) => {
        const provider = this.providers.get(method);
        if (!provider || !provider.isSupported()) {
          return;
        }

        try {
          await provider.scheduleNotification(event.message, scheduledFor);
          this.logNotification(
            userId || event.userId || 'unknown',
            event.type,
            method,
            'scheduled',
            undefined,
            scheduledFor
          );
        } catch (error) {
          this.logNotification(
            userId || event.userId || 'unknown',
            event.type,
            method,
            'failed',
            error as Error
          );
        }
      });

    await Promise.allSettled(schedulePromises);
  }

  async cancelNotification(notificationId: string): Promise<void> {
    const cancelPromises = Array.from(this.providers.values()).map(provider =>
      provider.cancelNotification(notificationId).catch(error => {
        GlobalErrorHandler.logError(error, 'NotificationEngine.cancelNotification', { notificationId, providerName: provider.name });
      })
    );

    await Promise.allSettled(cancelPromises);
  }

  async cancelAllNotifications(): Promise<void> {
    const cancelPromises = Array.from(this.providers.values()).map(provider =>
      provider.cancelAllNotifications().catch(error => {
        GlobalErrorHandler.logError(error, 'NotificationEngine.cancelAllNotifications', { providerName: provider.name });
      })
    );

    await Promise.allSettled(cancelPromises);
  }

  getProvider(method: NotificationDeliveryMethod): NotificationProvider | undefined {
    return this.providers.get(method);
  }

  getEnabledProviders(): NotificationDeliveryMethod[] {
    return Array.from(this.providers.keys());
  }

  getLogs(userId?: string, limit?: number): NotificationLog[] {
    let filteredLogs = this.logs;

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs.sort((a, b) =>
      (b.sentAt || b.scheduledFor || new Date()).getTime() -
      (a.sentAt || a.scheduledFor || new Date()).getTime()
    );
  }

  clearLogs(userId?: string): void {
    if (userId) {
      this.logs = this.logs.filter(log => log.userId !== userId);
    } else {
      this.logs = [];
    }
  }

  private logNotification(
    userId: string,
    type: NotificationType,
    deliveryMethod: NotificationDeliveryMethod,
    status: 'scheduled' | 'sent' | 'failed' | 'cancelled',
    error?: Error,
    scheduledFor?: Date
  ): void {
    if (!this.config.enableLogging) return;

    const log: NotificationLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      status,
      deliveryMethod,
      sentAt: status === 'sent' ? new Date() : undefined,
      scheduledFor,
      errorMessage: error?.message,
      metadata: error ? { stack: error.stack } : undefined
    };

    this.logs.push(log);

    // Keep only last 1000 logs to prevent memory leaks
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  private notifySubscribers(
    event: keyof NotificationSubscriber,
    ...args: any[]
  ): void {
    this.subscribers.forEach(subscriber => {
      const handler = subscriber[event];
      if (handler && typeof handler === 'function') {
        try {
          (handler as Function)(...args);
        } catch (error) {
          GlobalErrorHandler.logError(error, 'NotificationEngine.notifySubscribers', { event });
        }
      }
    });
  }
}