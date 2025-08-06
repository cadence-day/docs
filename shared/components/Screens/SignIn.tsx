import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {router } from "expo-router";
import { useSignIn, useAuth } from "@clerk/clerk-expo";

const LoginComponent: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();

  // If already signed in, don't render the sign-in form
  if (isSignedIn) {
    return null;
  }

  const onSignInPress = async () => {
    // Don't attempt to sign in if already signed in
    if (isSignedIn) {
      console.log("Already signed in, redirecting to home");
      router.replace("/");
      return;
    }

    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };



  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text
        style={{
          textAlign: "center",
          fontSize: 20,
          color: "#FFFFFF",
          marginBottom: 30,
        }}
      >
        Cadence
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#A5A1A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#B9B9B9"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          textContentType="password"
          autoComplete="password"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color="#B9B9B9"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        <TouchableOpacity onPress={() => router.push("/sign-up")}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#FFFFFF",
              width: 140,
              color: "#FFFFFF",
              padding: 10,
              marginRight: 10,
            }}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSignInPress}>
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#FFFFFF",
              color: "#FFFFFF",
              padding: 10,
              width: 140,
            }}
          >
            Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    width: "100%",
  },
  error: {
    color: "#FE4437",
    fontSize: 11,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#FFFFFF",
    color: "#FFFFFF",
    fontSize: 14,
    height: 40,
    marginBottom: 12,
  },
  message: {
    color: "blue",
    fontSize: 11,
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase",
  },
  forgotPassword: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "left",
    marginBottom: 12,
    marginTop: 10,
  },
  passwordContainer: {
    borderBottomWidth: 1,
    borderColor: "#FFFFFF",
    color: "#FFFFFF",
    fontSize: 14,
    height: 40,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
  },
  eyeIcon: {
    marginLeft: 8,
  },
});

export default LoginComponent;
