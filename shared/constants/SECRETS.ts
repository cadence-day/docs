import Constants from "expo-constants";

/**
 * Environment configuration and secrets
 * Populated by Doppler in production/staging or .env.development for local dev
 */
export const SECRETS = {
    // Supabase
    EXPO_PUBLIC_SUPABASE_URL:
        Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_KEY:
        Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_KEY ||
        process.env.EXPO_PUBLIC_SUPABASE_KEY,

    // Clerk Authentication
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,

    // LangGraph/AI
    EXPO_PUBLIC_LANGGRAPH_API_URL:
        Constants.expoConfig?.extra?.EXPO_PUBLIC_LANGGRAPH_API_URL ||
        process.env.EXPO_PUBLIC_LANGGRAPH_API_URL,
    EXPO_PUBLIC_LANGGRAPH_ASSISTANT_ID:
        Constants.expoConfig?.extra?.EXPO_PUBLIC_LANGGRAPH_ASSISTANT_ID ||
        process.env.EXPO_PUBLIC_LANGGRAPH_ASSISTANT_ID,
    LANGGRAPH_URL: Constants.expoConfig?.extra?.LANGGRAPH_URL ||
        process.env.LANGGRAPH_URL,
    LANGGRAPH_API_KEY: Constants.expoConfig?.extra?.LANGGRAPH_API_KEY ||
        process.env.LANGGRAPH_API_KEY,

    // Groq (Speech-to-text)
    GROQ_API_KEY: Constants.expoConfig?.extra?.GROQ_API_KEY ||
        process.env.GROQ_API_KEY,

    // Mistral
    EXPO_MISTRAL_API_KEY: Constants.expoConfig?.extra?.EXPO_MISTRAL_API_KEY ||
        process.env.EXPO_MISTRAL_API_KEY,
} as const;

// Type guard to ensure required secrets are present
export const validateRequiredSecrets = () => {
    const required = [
        "EXPO_PUBLIC_SUPABASE_URL",
        "EXPO_PUBLIC_SUPABASE_KEY",
        "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
    ] as const;

    const missing = required.filter((key) => !SECRETS[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }
};
