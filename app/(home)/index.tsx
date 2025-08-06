import { SignedIn, SignedOut, useUser } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { Text, View } from "react-native";
import { useLayoutEffect } from "react";
import { SignOutButton } from "@/shared/components/SignOutButton";

export default function Page() {
  const { user } = useUser();


  return (
    <View 
      style={{ 
        gap: 10,
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center",
      }}
      >
      <SignedIn>
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      
      <SignedOut>
        <View
        style={{ 
          gap: 10,
          flex: 1, 
          width: "100%",
          justifyContent: "center", 
          alignItems: "center",
          backgroundColor: "blue",
        }}
        >
          <Link href="/(auth)/sign-in">
            <Text style={{ color: "white" }}>Sign in</Text>
          </Link>
          <Link href="/(auth)/sign-up">
            <Text style={{ color: "white" }}>Sign up</Text>
          </Link>
        </View>
      </SignedOut>
    </View>
  );
}
