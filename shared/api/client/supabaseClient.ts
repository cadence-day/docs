import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/clerk-expo";
import { SECRETS, validateRequiredSecrets } from "../../constants/SECRETS";
import { Database } from "../../types/database.types";

// Validate required secrets on import
validateRequiredSecrets();

const supabaseUrl = SECRETS.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = SECRETS.EXPO_PUBLIC_SUPABASE_KEY!;

/**
 * Create a base Supabase client for unauthenticated operations
 */

export const supabaseClient = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
        // Session accessed from Clerk SDK, either as Clerk.session (vanilla
        // JavaScript) or useSession (React)
        accessToken: async () => session?.getToken() ?? null,
    },
);
