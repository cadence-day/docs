import { SignedIn, SignedOut, useUser, useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { useLayoutEffect } from "react";
import { SignOutButton } from "@/shared/components/SignOutButton";
import React from "react";
import SignIn from "@/shared/components/Screens/SignIn";

export default function Page() {
  const { user } = useUser();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");

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
          <SignIn  />
        </View>
      </SignedOut>
    </View>
  );
}
