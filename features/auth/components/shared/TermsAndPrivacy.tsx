import { Linking, TouchableOpacity, View } from "react-native";
import CdText from "@/shared/components/CdText";
import { styles } from "../style";

const TermsAndPrivacy = () => {
  return (
    <View style={{ width: "100%", gap: 5 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <CdText variant="body" size="medium">
          By signing up, you agree to our{" "}
        </CdText>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.google.com")}>
          <CdText variant="link" size="medium" style={styles.link}>
            Privacy Policy
          </CdText>
        </TouchableOpacity>
      </View>
      
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <CdText variant="body" size="medium">
          and{" "}
        </CdText>
        <TouchableOpacity onPress={() => Linking.openURL("https://www.google.com")}>
          <CdText variant="link" size="medium" style={styles.link}>
            Terms and Conditions
          </CdText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TermsAndPrivacy;