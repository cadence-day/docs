import React, { useState, useEffect, useCallback } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CdButton from "../../../../shared/components/CdButton";
import CdText from "../../../../shared/components/CdText";
import CdTextInput from "../../../../shared/components/CdTextInput";
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { OAuthStrategy } from '@clerk/types'

export const useWarmUpBrowser = () => {
  const { startSSOFlow } = useSSO()
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { startSSOFlow } = useSSO()
  useWarmUpBrowser()

  // Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()


  // Handlers
  const handleLogin = async () => {
    setError(null);
    setMessage(null);
    // TODO: Add your login logic here (API call, validation, etc.)
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    // Simulate login
    setMessage("Logging in...");
    setTimeout(() => {
      setMessage(null);
      setError("Invalid credentials"); // Simulate error
    }, 1000);
  };

  const handleSignup = () => {
    router.push("/(auth)/sign-up");
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const onPress = useCallback(async (strategy: string) => {
    try {
      
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: strategy as OAuthStrategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      if (createdSessionId) {
        setActive!({ session: createdSessionId })
      } 
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])

  return ( 
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={localStyles.container}
    >
      <CdText variant="title" size="large" style={localStyles.title}>
        Cadence
      </CdText>
      {error && <CdText variant="error" size="small" style={localStyles.error}>{error}</CdText>}
      {message && <CdText variant="message" size="small" style={localStyles.message}>{message}</CdText>}
      <CdTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        
      />
      <CdTextInput
        value={password}
        onChangeText={setPassword}
        isPassword={true}
        textContentType="password"
        autoComplete="password"
        placeholder="Password"
      />
      <TouchableOpacity onPress={handleForgotPassword}>
        <CdText variant="link" size="medium" style={localStyles.forgotPassword}>Forgot Password?</CdText>
      </TouchableOpacity>
      <View style={localStyles.buttonContainer}>
        <CdButton
          title="Sign Up"
          onPress={handleSignup}
          variant="outline"
          size="medium"
          style={localStyles.button}
        />
        <CdButton
          title="Sign in"
          onPress={handleLogin}
          variant="outline"
          size="medium"
          style={localStyles.button}
        />
      </View>
      <View style={localStyles.socialContainer}>
        <CdButton
            title="Sign in with Google"
            onPress={() => onPress("oauth_google")}
            variant="outline"
            size="medium"
            style={localStyles.socialButton}
          />
          <CdButton
            title="Sign in with Apple"
            onPress={() => onPress("oauth_apple")}
            variant="outline"
            size="medium"
            style={localStyles.socialButton}
          />
      </View>
    </LinearGradient>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    marginBottom: 30,
  },
  error: {
    marginBottom: 12,
    textAlign: "center",
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
    marginBottom: 12,
    textAlign: "center",
  },
  forgotPassword: {
    marginBottom: 12,
    marginTop: 10,
  },
  passwordInput: {
    flex: 1,
    color: "#FFFFFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 10,
  },
  socialContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },
  socialButton: {
    width: "100%",
  },
  button: {
    width: "48%",
  },

});

export default SignInScreen;