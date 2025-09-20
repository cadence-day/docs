import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { DEFAULT_CADENCE_PREFERENCES } from "./cadenceMessages";
import { NotificationEngine } from "./NotificationEngine";
import { ExpoNotificationProvider } from "./providers/ExpoNotificationProvider";
import { InAppNotificationProvider } from "./providers/InAppNotificationProvider";
import { LocaleNotificationProvider } from "./providers/LocaleNotificationProvider";
import { NotificationEngineConfig } from "./types";

interface NotificationEngineSingletonState {
    engine: NotificationEngine | null;
    isInitialized: boolean;
    isInitializing: boolean;
    currentConfig: NotificationEngineConfig | null;
    initializationPromise: Promise<NotificationEngine> | null;
    subscribers: Set<(engine: NotificationEngine | null) => void>;
    inAppProvider: InAppNotificationProvider | null;
}

class NotificationEngineSingletonManager {
    private state: NotificationEngineSingletonState = {
        engine: null,
        isInitialized: false,
        isInitializing: false,
        currentConfig: null,
        initializationPromise: null,
        subscribers: new Set(),
        inAppProvider: null,
    };

    /**
     * Get or create the notification engine singleton
     */
    async getInstance(
        config?: Partial<NotificationEngineConfig>,
    ): Promise<NotificationEngine> {
        const fullConfig: NotificationEngineConfig = {
            enabledProviders: config?.enabledProviders ??
                ["push", "local", "in-app"],
            defaultPreferences: config?.defaultPreferences ??
                DEFAULT_CADENCE_PREFERENCES,
            enableLogging: config?.enableLogging ?? true,
        };

        // If engine exists and config hasn't changed, return existing instance
        if (
            this.state.engine &&
            this.state.isInitialized &&
            this.configEquals(fullConfig, this.state.currentConfig)
        ) {
            return this.state.engine;
        }

        // If already initializing with same config, wait for completion
        if (
            this.state.isInitializing &&
            this.state.initializationPromise &&
            this.configEquals(fullConfig, this.state.currentConfig)
        ) {
            return this.state.initializationPromise;
        }

        // Clean up existing engine if config changed
        if (
            this.state.engine &&
            !this.configEquals(fullConfig, this.state.currentConfig)
        ) {
            await this.cleanup();
        }

        // Start initialization
        this.state.isInitializing = true;
        this.state.currentConfig = fullConfig;
        this.state.initializationPromise = this.initializeEngine(fullConfig);

        try {
            const engine = await this.state.initializationPromise;
            this.state.engine = engine;
            this.state.isInitialized = true;
            this.state.isInitializing = false;
            this.notifySubscribers(engine);
            return engine;
        } catch (error) {
            this.state.isInitializing = false;
            this.state.initializationPromise = null;
            throw error;
        }
    }

    /**
     * Get the current engine instance (may be null if not initialized)
     */
    getCurrentInstance(): NotificationEngine | null {
        return this.state.engine;
    }

    /**
     * Get the in-app provider for direct access to notifications
     */
    getInAppProvider(): InAppNotificationProvider | null {
        return this.state.inAppProvider;
    }

    /**
     * Subscribe to engine changes
     */
    subscribe(
        callback: (engine: NotificationEngine | null) => void,
    ): () => void {
        this.state.subscribers.add(callback);

        // Immediately call with current engine if available
        if (this.state.engine) {
            callback(this.state.engine);
        }

        return () => {
            this.state.subscribers.delete(callback);
        };
    }

    /**
     * Check if the engine is initialized
     */
    isInitialized(): boolean {
        return this.state.isInitialized;
    }

    /**
     * Check if the engine is currently initializing
     */
    isInitializing(): boolean {
        return this.state.isInitializing;
    }

    /**
     * Cleanup and reset the singleton
     */
    async cleanup(): Promise<void> {
        try {
            if (this.state.engine) {
                this.state.engine.clearLogs();
            }

            this.state.engine = null;
            this.state.isInitialized = false;
            this.state.isInitializing = false;
            this.state.currentConfig = null;
            this.state.initializationPromise = null;
            this.state.inAppProvider = null;

            this.notifySubscribers(null);
        } catch (error) {
            GlobalErrorHandler.logError(
                error,
                "NotificationEngineSingleton.cleanup",
            );
        }
    }

    private async initializeEngine(
        config: NotificationEngineConfig,
    ): Promise<NotificationEngine> {
        try {
            GlobalErrorHandler.logDebug(
                "Initializing NotificationEngine singleton",
                "NotificationEngineSingleton",
            );

            const engine = new NotificationEngine(config);

            // Create providers
            const expoProvider = new ExpoNotificationProvider();
            const inAppProvider = new InAppNotificationProvider({
                autoHideDuration: 5000,
                maxDisplayedNotifications: 3,
                persistNotifications: true,
            });

            // Store in-app provider for external access
            this.state.inAppProvider = inAppProvider;

            // Wrap providers with locale support
            const localeExpoProvider = new LocaleNotificationProvider(
                expoProvider,
            );
            const localeInAppProvider = new LocaleNotificationProvider(
                inAppProvider,
            );

            // Register providers
            engine.registerProvider("push", localeExpoProvider);
            engine.registerProvider("local", localeExpoProvider);
            engine.registerProvider("in-app", localeInAppProvider);

            // Initialize engine
            await engine.initialize();

            GlobalErrorHandler.logDebug(
                "NotificationEngine singleton initialized successfully",
                "NotificationEngineSingleton",
            );

            return engine;
        } catch (error) {
            GlobalErrorHandler.logError(
                error,
                "NotificationEngineSingleton.initializeEngine",
            );
            throw new Error("Failed to initialize notification engine");
        }
    }

    private configEquals(
        config1: NotificationEngineConfig | null,
        config2: NotificationEngineConfig | null,
    ): boolean {
        if (!config1 || !config2) return false;

        return (
            JSON.stringify(config1.enabledProviders?.sort()) ===
                JSON.stringify(config2.enabledProviders?.sort()) &&
            JSON.stringify(config1.defaultPreferences) ===
                JSON.stringify(config2.defaultPreferences) &&
            config1.enableLogging === config2.enableLogging
        );
    }

    private notifySubscribers(engine: NotificationEngine | null): void {
        this.state.subscribers.forEach((callback) => {
            try {
                callback(engine);
            } catch (error) {
                GlobalErrorHandler.logError(
                    error,
                    "NotificationEngineSingleton.notifySubscribers",
                );
            }
        });
    }
}

// Export singleton instance
export const notificationEngineSingleton =
    new NotificationEngineSingletonManager();

/**
 * Convenience function to get the notification engine singleton
 */
export async function getNotificationEngineSingleton(
    config?: Partial<NotificationEngineConfig>,
): Promise<NotificationEngine> {
    return notificationEngineSingleton.getInstance(config);
}
