import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { styles as sharedStyles } from "../style"; // Use shared styles if available
// If you have these dialogs, import them, otherwise comment/remove
// import SignupDialog from "./SignupDialog";
import ForgotPasswordDialog from "../dialogs/ForgotPassword/ForgotPasswordDialog";

const SignInScreen = () => {
  // State variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    setShowSignup(true);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  return (
    <LinearGradient
      colors={["#2B2B2B", "#151414"]}
      locations={[0, 0.6]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={localStyles.container}
    >
      {/* Uncomment if you have these dialogs */}
      {/* <SignupDialog
        visible={showSignup}
        onClose={() => setShowSignup(false)}
        closeDialog={() => setShowSignup(false)}
      /> */}
      <ForgotPasswordDialog
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
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
      {error && <Text style={localStyles.error}>{error}</Text>}
      {message && <Text style={localStyles.message}>{message}</Text>}
      <TextInput
        style={localStyles.input}
        placeholder="Email"
        placeholderTextColor="#A5A1A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
      />
      <View style={localStyles.passwordContainer}>
        <TextInput
          style={localStyles.passwordInput}
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
          style={localStyles.eyeIcon}
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
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={localStyles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        <TouchableOpacity onPress={handleSignup}>
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
        <TouchableOpacity onPress={handleLogin}>
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

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    width: "100%",
    height: "100%",
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

export default SignInScreen;