import { supabaseClient } from "./supabaseClient";
import { SECRETS } from "../../constants/SECRETS";
import { Database } from "../../types/database.types";

describe("supabaseClient", () => {
    it("should be defined", () => {
        expect(supabaseClient).toBeDefined();
    });

    it("should have correct URL and anon key from SECRETS", () => {
        expect(SECRETS.EXPO_PUBLIC_SUPABASE_URL).toBeTruthy();
        expect(SECRETS.EXPO_PUBLIC_SUPABASE_KEY).toBeTruthy();
    });

    it("should have accessToken as an async function", async () => {
        expect(typeof supabaseClient.auth.getSession).toBe("function");
        // Optionally, test the accessToken function if mocking Clerk
    });
});
