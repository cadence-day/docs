import { Stack } from "expo-router/stack";

export default function UtilsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
