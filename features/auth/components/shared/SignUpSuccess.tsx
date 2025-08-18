import { View } from "react-native";
import CdText from "@/shared/components/CdText";
import { Star5 } from "@/shared/components/icons/SageIcon";
import { styles } from "../style";

const SignUpSuccess = () => {
  return (
    <View style={styles.centerContent}>
      <CdText variant="title" size="large" style={styles.title}>
        Welcome
      </CdText>
      <CdText variant="body" size="medium" style={styles.successText}>
        Check your inbox for verification email.
      </CdText>
      <Star5 width={100} height={100} />
      <View style={{ height: 20 }} />
      <CdText variant="title" size="medium" style={styles.title}>
        Cadence is in beta.
      </CdText>
      <CdText variant="body" size="medium" style={styles.successText}>
        We are working on improving the app. Your feedback would be greatly appreciated. You can find the link to feedback page under the Profile.
      </CdText>
    </View>
  );
};

export default SignUpSuccess;