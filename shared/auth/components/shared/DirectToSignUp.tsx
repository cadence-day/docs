import { CdText } from "@/shared/components/CadenceUI";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../style";

const DirectToSignUp = () => {
  const handleSignup = () => {
    router.push("/(auth)/sign-up");
  };

  return (
    <View style={styles.signupContainer}>
      <CdText variant="body" size="medium" style={styles.signupText}>
        Don't have an account?{" "}
      </CdText>
      <TouchableOpacity onPress={handleSignup}>
        <CdText variant="link" size="medium">
          Sign up now.
        </CdText>
      </TouchableOpacity>
    </View>
  );
};

export default DirectToSignUp;
