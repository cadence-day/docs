import Timeline from "@/features/timeline/Timeline";
import { CdDialogHeader } from "@/shared/components/CadenceUI";
import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SignIn from "../(auth)/sign-in";

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SignedIn>
        <CdDialogHeader title="Today" bottomBorder={true} />
        <View
          style={{
            height: 300,
            flex: 1,
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Timeline />
        </View>
      </SignedIn>

      <SignedOut>
        <SignIn />
      </SignedOut>
    </SafeAreaView>
  );
}
