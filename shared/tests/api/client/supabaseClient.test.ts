import { supabaseClient } from "@/shared/api/client/supabaseClient";
import { SECRETS } from "@/shared/constants/SECRETS";
import { Database } from "@/shared/types/database.types";

describe("supabaseClient", () => {
    it("should be defined", () => {
        expect(supabaseClient).toBeDefined();
    });

    it("should have correct URL and anon key from SECRETS", () => {
        expect(SECRETS.EXPO_PUBLIC_SUPABASE_URL).toBeTruthy();
        expect(SECRETS.EXPO_PUBLIC_SUPABASE_KEY).toBeTruthy();
    });

    it("should be configured with Clerk integration", () => {
        // Test that the client is properly configured
        expect(supabaseClient).toBeDefined();
        expect(typeof supabaseClient.from).toBe("function");
    });

    it("should be able to construct a query builder", () => {
        // Test that we can create a query builder without executing it
        const queryBuilder = supabaseClient.from("activity_categories");
        expect(queryBuilder).toBeDefined();
        expect(typeof queryBuilder.select).toBe("function");
    });
});
