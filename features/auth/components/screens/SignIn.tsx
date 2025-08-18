import React, { useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import CdButton from "@/shared/components/CdButton";
import CdText from "@/shared/components/CdText";
import CdTextInput from "@/shared/components/CdTextInput";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';
import { OAuthStrategy } from '@clerk/types';
import { styles } from "../style";
import DirectToSignUp from "../shared/DirectToSignUp";

export const useWarmUpBrowser = () => {
  const { startSSOFlow } = useSSO();
  
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const { startSSOFlow } = useSSO();
  useWarmUpBrowser();

  // Handle any pending authentication sessions
  WebBrowser.maybeCompleteAuthSession();

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



  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    console.log("Forgot password clicked");
  };

  const onPress = useCallback(async (strategy: string) => {
    try {
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: strategy as OAuthStrategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [startSSOFlow]);

  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <CdText variant="title" size="large" style={styles.title}>
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

        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordContainer}
        >
          <CdText variant="link" size="medium" style={styles.forgotPasswordText}>
            Forgot password?
          </CdText>
        </TouchableOpacity>

        <View style={styles.socialContainer}>
          <CdButton
            title="Log in with Google"
            onPress={() => onPress("oauth_google")}
            variant="outline"
            size="medium"
            style={styles.socialButton}
          />
          <CdButton
            title="Log in with Apple"
            onPress={() => onPress("oauth_apple")}
            variant="outline"
            size="medium"
            style={styles.socialButton}
          />
        </View>

        <DirectToSignUp />

        <View style={styles.errorContainer}>
          {error && (
            <CdText variant="error" size="medium" style={styles.error}>
              {error}
            </CdText>
          )}
          {message && (
            <CdText variant="message" size="medium" style={styles.message}>
              {message}
            </CdText>
          )}
        </View>

        <View style={styles.actionButtonContainer}>
          <CdButton
            title="Sign in"
            onPress={handleLogin}
            variant="text"
            size="large"
            style={styles.signinButton}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

export default SignInScreen;