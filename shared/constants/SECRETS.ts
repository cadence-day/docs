import Constants from "expo-constants";

export const SECRETS = {
  SUPABASE: {
    URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ?? "",
    ANON_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_KEY ?? "",
  },
  LANGGRAPH: {
    URL: Constants.expoConfig?.extra?.LANGGRAPH_URL ?? "",
    API_KEY: Constants.expoConfig?.extra?.LANGGRAPH_API_KEY ?? "",
  },
  APPSIGNAL: {
    FRONTEND_API_KEY:
      Constants.expoConfig?.extra?.APPSIGNAL_FRONTEND_API_KEY ?? "",
  },
  GROQ_API_KEY: Constants.expoConfig?.extra?.GROQ_API_KEY ?? "",
};
