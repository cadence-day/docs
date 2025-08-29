import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { Stack } from "expo-router/stack";
import { Tabs } from "expo-router/tabs";

export default function Layout() {
  return (
    <>
      <SignedIn>
        {/* Let expo-router auto-generate tabs from files in this folder:
            index.tsx (Today), reflection.tsx (Reflection), profile.tsx (Profile) */}
        <Tabs
          screenOptions={{
            headerShown: false,
          }}
        />
      </SignedIn>

      <SignedOut>
        {/* When signed out, fall back to the auth stack (sign-in/up) */}
        <Stack screenOptions={{ headerShown: false }} />
      </SignedOut>
    </>
  );
}
