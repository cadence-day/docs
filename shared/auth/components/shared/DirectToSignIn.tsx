import { CdText } from "@/shared/components/CadenceUI";
import { router } from "expo-router";
import { useI18n } from "@/shared/hooks/useI18n";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../style";

const DirectToSignIn = () => {
  const { t } = useI18n();

  return (
    <View style={styles.signInTextContainer}>
      <CdText variant="body" size="small" style={styles.signInText}>
        {t("already-have-an-account")}{" "}
      </CdText>
      <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
        <CdText variant="link" size="small">
          {t("sign-in-now")}
        </CdText>
      </TouchableOpacity>
    </View>
  );
};

export default DirectToSignIn;
