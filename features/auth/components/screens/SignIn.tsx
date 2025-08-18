import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import CdButton from "@/shared/components/CdButton";
import CdText from "@/shared/components/CdText";
import CdTextInput from "@/shared/components/CdTextInput";
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
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
    // TODO: Implement forgot password functionality
    console.log("Forgot password clicked");
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
      <View style={localStyles.content}>
        <CdText variant="title" size="large" style={localStyles.title}>
          Welcome back
        </CdText>
       
        <CdTextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />
        
        <CdTextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword={true}
          textContentType="password"
          autoComplete="password"
        />
        
        <TouchableOpacity onPress={handleForgotPassword} style={localStyles.forgotPasswordContainer}>
          <CdText variant="link" size="medium" style={localStyles.forgotPasswordText}>Forgot password?</CdText>
        </TouchableOpacity>
        
        <View style={localStyles.socialContainer}>
          <CdButton
            title="Log in with Google"
            onPress={() => onPress("oauth_google")}
            variant="outline"
            size="medium"
            style={localStyles.socialButton}
          />
          <CdButton
            title="Log in with Apple"
            onPress={() => onPress("oauth_apple")}
            variant="outline"
            size="medium"
            style={localStyles.socialButton}
          />
        </View>
        
        <View style={localStyles.signupContainer}>
          <CdText variant="body" size="medium" style={localStyles.signupText}>
            Don't have an account?{" "}
          </CdText>
          <TouchableOpacity onPress={handleSignup}>
              <CdText variant="link" size="medium">
                Sign up now.
              </CdText>
            </TouchableOpacity>
        </View>
        <View style={localStyles.errorContainer}>
        {error && <CdText variant="error" size="medium" style={localStyles.error}>{error}</CdText>}
        {message && <CdText variant="message" size="medium" style={localStyles.message}>{message}</CdText>}
        </View>
        <View style={localStyles.actionButtonContainer}>
          <CdButton
            title="Sign in"
            onPress={handleLogin}
            variant="text"
            size="large"
            style={localStyles.signinButton}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  title: {
    marginBottom: 40,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "normal",
    color: "#FFFFFF",
  },
  error: {
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    marginBottom: 20,
    textAlign: "center",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-start",
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "normal",
    textDecorationLine: "none",
    color: "#FFFFFF",
  },
  socialContainer: {
    marginBottom: 30,
    gap: 16,
  },
  socialButton: {
    width: "100%",
  },
  signupContainer: {
    marginBottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  signupText: {
    textAlign: "center",
  },
  errorContainer: {
    position: "absolute",
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  actionButtonContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  signinButton: {
    width: "100%",
  },
});

export default SignInScreen;