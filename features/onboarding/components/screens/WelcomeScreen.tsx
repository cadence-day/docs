import React from "react";
import { Text, View } from "react-native";
import { onboardingStyles as styles } from "../../styles";
import { OnboardingPage } from "../../types";

interface WelcomeScreenProps {
  pageData: OnboardingPage;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ pageData }) => {
  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{pageData.title}</Text>
        <Text style={styles.content}>{pageData.content}</Text>
      </View>
    </View>
  );
};
