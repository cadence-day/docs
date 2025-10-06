import { CdText } from "@/shared/components/CadenceUI";
import { Star5 } from "@/shared/components/icons/SageIcon";
import { useI18n } from "@/shared/hooks/useI18n";
import { View } from "react-native";
import { styles } from "../style";

const SignUpSuccess = () => {
  const { t } = useI18n();
  return (
    <View style={styles.centerContent}>
      <CdText variant="title" size="large" style={styles.title}>
        {t("welcome")}
      </CdText>

      <CdText variant="body" size="medium" style={styles.successText}>
        {t("check-your-inbox-for-verification-email")}
      </CdText>

      <Star5 width={100} height={100} />

      <View style={styles.spacer20} />

      <CdText variant="title" size="medium" style={styles.title}>
        {t("cadence-is-in-beta")}
      </CdText>

      <CdText variant="body" size="medium" style={styles.successText}>
        {t(
          "we-are-working-on-improving-the-app-your-feedback-would-be-greatly-appreciated-you-can-find-the-link-to-feedback-page-under-the-profile"
        )}
      </CdText>
    </View>
  );
};

export default SignUpSuccess;
