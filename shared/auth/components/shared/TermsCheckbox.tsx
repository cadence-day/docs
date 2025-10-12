import { CdText } from "@/shared/components/CadenceUI";
import { COLORS } from "@/shared/constants/COLORS";
import { useI18n } from "@/shared/hooks/useI18n";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../style";

interface TermsCheckboxProps {
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

const handleOpenTerms = async () => {
  await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/terms", {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  });
};

const handleOpenPrivacy = async () => {
  await WebBrowser.openBrowserAsync("https://app.cadence.day/legal/privacy", {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
  });
};

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  isChecked,
  onToggle,
}) => {
  const { t } = useI18n();
  return (
    <View style={styles.termsContainer}>
      <TouchableOpacity
        style={styles.termsCheckboxRow}
        onPress={() => onToggle(!isChecked)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.termsCheckboxBox,
            isChecked
              ? styles.termsCheckboxBoxChecked
              : styles.termsCheckboxBoxUnchecked,
          ]}
        >
          {isChecked && (
            <Ionicons name="checkmark" size={14} color={COLORS.white} />
          )}
        </View>

        <View style={styles.termsTextContainer}>
          <View style={styles.termsTextRow}>
            <CdText variant="body" size="small">
              {t("i-agree-to-the")}{" "}
            </CdText>
            <TouchableOpacity onPress={handleOpenPrivacy}>
              <CdText variant="link" size="small" style={styles.link}>
                {t("privacy-policy")}
              </CdText>
            </TouchableOpacity>
            <CdText variant="body" size="small">
              {" "}
              and{" "}
            </CdText>
            <TouchableOpacity onPress={handleOpenTerms}>
              <CdText variant="link" size="small" style={styles.link}>
                {t("terms-and-conditions")}
              </CdText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TermsCheckbox;
