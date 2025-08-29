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
    <View style={{ width: "100%", gap: 12, marginVertical: 8 }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
        onPress={() => onToggle(!isChecked)}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: isChecked ? COLORS.primary : COLORS.white,
            backgroundColor: isChecked ? COLORS.primary : "#666",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          {isChecked && (
            <Ionicons name="checkmark" size={14} color={COLORS.white} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <CdText variant="body" size="medium">
              {t("i-agree-to-the")}{" "}
            </CdText>
            <TouchableOpacity onPress={handleOpenPrivacy}>
              <CdText variant="link" size="medium" style={styles.link}>
                {t("privacy-policy")}
              </CdText>
            </TouchableOpacity>
            <CdText variant="body" size="medium">
              {" "}
              and{" "}
            </CdText>
            <TouchableOpacity onPress={handleOpenTerms}>
              <CdText variant="link" size="medium" style={styles.link}>
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
