import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CdTextInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  isPassword?: boolean;
  isRequired?: boolean;
  onChangeText: (text: string) => void;
  value: string;
}

const CdTextInput: React.FC<CdTextInputProps> = ({
  label,
  error,
  isPassword = false,
  isRequired = false,
  onChangeText,
  value,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;
  const hasValue = value.length > 0;

  return (
    <View style={styles.container}>

      <Text style={styles.label}>
       {label}
      </Text> 
    
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        <TextInput
          style={[styles.input, hasError && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#9CA3AF"
          returnKeyType="next"
          {...textInputProps}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>

      {hasError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    color: "#A1A1A1",
    marginBottom: 6,
  },
  labelError: {
    color: "#EF4444",
  },
  required: {
    color: "#EF4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#ffffff",
    borderBottomWidth: 0.5,
    minHeight: 36,
    minWidth: "100%",
  },
  inputContainerFocused: {
    borderBottomColor: "#6646EC",
  },
  inputContainerError: {
    borderBottomColor: "#EF4444",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#ffffff",
    paddingVertical: 6,
  },
  inputError: {
    color: "#EF4444",
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginLeft: 4,
    flex: 1,
  },
});

export default CdTextInput;
