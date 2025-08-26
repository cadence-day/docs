import { CdText } from "@/shared/components/CadenceUI";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function ClerkRedirect() {
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Completes any pending auth session started by expo-auth-session / WebBrowser
        await WebBrowser.maybeCompleteAuthSession();
      } catch (err) {
        GlobalErrorHandler.logError(err, "CLERK_AUTH_SESSION_COMPLETION", {
          component: "ClerkRedirect",
          operation: "complete_auth_session",
        });
      } finally {
        if (mounted) {
          // Navigate to home; the auth layout will redirect signed-in users appropriately
          router.replace("/");
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      {/* TODO: Icon or text. */}
      <CdText variant="body" size="medium" style={styles.text}>
        Completing sign in...
      </CdText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { marginTop: 12 },
});
