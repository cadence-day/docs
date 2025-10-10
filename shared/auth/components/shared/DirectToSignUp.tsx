import { CdText } from "@/shared/components/CadenceUI";
import { useI18n } from "@/shared/hooks/useI18n";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../style";

const DirectToSignUp = () => {
  const handleSignup = () => {
    router.push("/(auth)/sign-up");
  };
  const { t } = useI18n();

  return (
    <View style={styles.signupContainer}>
      <CdText variant="body" size="small" style={styles.signupText}>
        {t("dont-have-an-account")}{" "}
      </CdText>
      <TouchableOpacity onPress={handleSignup}>
        <CdText variant="link" size="small">
          {t("sign-up-now")}
        </CdText>
      </TouchableOpacity>
    </View>
  );
};

export default DirectToSignUp;
