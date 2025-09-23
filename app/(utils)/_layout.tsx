import { Stack } from "expo-router/stack";

export default function UtilsLayout() {
  // Utility screens (loading, no-internet, not-found) render full-bleed
  // content and therefore should not display the native header. Make the
  // header hidden and ensure background is transparent so screens can draw
  // edge-to-edge backgrounds (gradients, images, etc.).
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
