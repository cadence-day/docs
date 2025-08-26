import { CdText } from "@/shared/components/CadenceUI";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../style";

const DirectToSignIn = () => {
  return (
    <View style={styles.signInTextContainer}>
      <CdText variant="body" size="small" style={styles.signInText}>
        Already have an account?{" "}
      </CdText>
      <TouchableOpacity onPress={() => router.push("/(auth)/sign-in")}>
        <CdText variant="link" size="medium">
          Sign in now.
        </CdText>
      </TouchableOpacity>
    </View>
  );
};

export default DirectToSignIn;
