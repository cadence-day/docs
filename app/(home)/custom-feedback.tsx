import { CustomFeedbackForm } from "@/shared/components/CustomFeedbackForm";
import { Stack, useRouter } from "expo-router";

export default function CustomFeedbackPage() {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Send Feedback",
          headerShown: true,
          presentation: "modal",
          headerBackTitle: "Close",
        }}
      />
      <CustomFeedbackForm onClose={handleClose} onSubmit={handleSubmit} />
    </>
  );
}
