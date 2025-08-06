import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { calculatePasswordStrength } from "../../utils/validation";

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showDetails = true,
}) => {
  const { score, label, color } = calculatePasswordStrength(password);

  if (!password) return null;

  const requirements = [
    { test: password.length >= 10, text: "At least 10 characters" },
    { test: /[a-z]/.test(password), text: "One lowercase letter" },
    { test: /[A-Z]/.test(password), text: "One uppercase letter" },
    { test: /\d/.test(password), text: "One number" },
    {
      test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      text: "One special character",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBarContainer}>
          <View
            style={[
              styles.strengthBar,
              {
                width: `${(score / 5) * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
      </View>

      {/* Requirements List */}
      {showDetails && (
        <View style={styles.requirementsContainer}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirement}>
              <View
                style={[
                  styles.requirementIcon,
                  {
                    backgroundColor: req.test ? "#10B981" : "#E5E7EB",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.requirementIconText,
                    { color: req.test ? "#FFFFFF" : "#6B7280" },
                  ]}
                >
                  {req.test ? "✓" : "•"}
                </Text>
              </View>
              <Text
                style={[
                  styles.requirementText,
                  { color: req.test ? "#10B981" : "#6B7280" },
                ]}
              >
                {req.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  strengthBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginRight: 12,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 50,
  },
  requirementsContainer: {
    gap: 6,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
  },
  requirementIcon: {
    width: 14,
    height: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  requirementIconText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  requirementText: {
    fontSize: 12,
  },
});

export default PasswordStrengthIndicator;
