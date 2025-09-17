import { CustomFeedbackForm } from "@/shared/components/CustomFeedbackForm";
import { useI18n } from "@/shared/hooks/useI18n";
import { Stack, useRouter } from "expo-router";

export default function CustomFeedbackPage() {
  const router = useRouter();
  const { t } = useI18n();

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
          title: t("send-feedback"),
          headerShown: true,
          presentation: "modal",
          headerBackTitle: t("close"),
        }}
      />
      <CustomFeedbackForm onClose={handleClose} onSubmit={handleSubmit} />
    </>
  );
}
