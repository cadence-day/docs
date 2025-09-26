import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/COLORS";

interface CdTextInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  isPassword?: boolean;
  isRequired?: boolean;
  letterSpacing?: number;
  onChangeText: (text: string) => void;
  value: string;
}

export const CdTextInput = forwardRef<TextInput, CdTextInputProps>(
  (
    {
      label,
      error,
      isPassword = false,
      isRequired = false,
      letterSpacing,
      onChangeText,
      value,
      ...textInputProps
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}

        <Text style={[hasError && styles.labelError]}>
          {isRequired && <Text style={styles.required}> *</Text>}
        </Text>

        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            hasError && styles.inputContainerError,
          ]}
        >
          <TextInput
            ref={ref}
            style={[
              styles.input,
              hasError && styles.inputError,
              letterSpacing !== undefined && { letterSpacing },
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={COLORS.placeholderText}
            placeholder={label}
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
                color={COLORS.textIcons}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, !hasError && styles.errorTextHidden]}>
            {error || " "}
          </Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    color: COLORS.bodyText,
    marginBottom: 6,
  },
  labelError: {
    color: COLORS.error,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: COLORS.white,
    borderBottomWidth: 1,
    minHeight: 20,
    minWidth: "100%",
  },
  inputContainerFocused: {
    borderBottomColor: COLORS.primary,
  },
  inputContainerError: {
    borderBottomColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    paddingVertical: 6,
  },
  inputError: {
    color: COLORS.error,
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
    color: COLORS.error,
    marginLeft: 4,
    flex: 1,
    textTransform: "uppercase",
  },
  errorTextHidden: {
    opacity: 0,
  },
});
