import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";
import { SECRETS } from "@/shared/constants/SECRETS";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={SECRETS.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <Slot />
    </ClerkProvider>
  );
}
