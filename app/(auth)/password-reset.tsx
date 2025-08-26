import PasswordResetScreen from "@/features/auth/components/screens/PasswordReset";
import { useLocalSearchParams } from "expo-router";

export default function PasswordResetPage() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return <PasswordResetScreen email={email} />;
}
