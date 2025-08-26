import { SentryTestComponent } from "@/shared/components/tests/SentryTestComponent";
import { Stack } from "expo-router";

export default function SentryTestPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Sentry Test",
          headerShown: true,
          headerBackTitle: "Home",
        }}
      />
      <SentryTestComponent />
    </>
  );
}
