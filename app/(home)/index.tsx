import { SignedIn, SignedOut } from "@clerk/clerk-expo";
import SignIn from "../(auth)/sign-in";
import { Timeline } from "@/features/timeline";
import { View } from "react-native";

export default function Page() {
  return (
    <View style={{ flex: 1 }}>
      <SignedIn>
        <Timeline />
      </SignedIn>

      <SignedOut>
        <SignIn />
      </SignedOut>
    </View>
  );
}

