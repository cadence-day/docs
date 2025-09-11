import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import { ACTIVITY_THEME } from '../../../constants';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string | null;
  showError?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'next' | 'search' | 'send' | 'go' | 'default';
}

export const FormInput = React.memo<FormInputProps>(({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  showError = false,
  disabled = false,
  required = false,
  autoCapitalize = 'sentences',
  returnKeyType = 'done',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={ACTIVITY_THEME.GRAY_LIGHT}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          editable={!disabled}
        />
      </View>
      {showError && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

FormInput.displayName = 'FormInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: ACTIVITY_THEME.WHITE,
    marginBottom: 6,
    textTransform: "uppercase",
    fontFamily: "FoundersGrotesk-Regular",
  },
  required: {
    color: ACTIVITY_THEME.ERROR_COLOR,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: ACTIVITY_THEME.BORDER_PURPLE,
    borderBottomWidth: 0.5,
    minHeight: 36,
    minWidth: "100%",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: ACTIVITY_THEME.WHITE,
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
  errorText: {
    fontSize: 12,
    color: ACTIVITY_THEME.ERROR_COLOR,
    marginTop: 6,
    marginLeft: 4,
  },
});