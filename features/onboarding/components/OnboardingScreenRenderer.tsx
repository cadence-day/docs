import { CdButton } from "@/shared/components/CadenceUI";
import React from "react";
import { Text, View } from "react-native";
import { onboardingStyles as styles } from "../styles";
import { OnboardingScreenProps } from "../types";
import { ActivityPickerContainer, NotificationTableContainer } from "./containers";
import { GridImage, NoteImage, TimelineImage } from "./ui";

export const OnboardingScreenRenderer: React.FC<OnboardingScreenProps> = ({
  pageData,
}) => {
  const renderPageContent = () => {
    switch (pageData.type) {
      case "activity-selection":
        return <ActivityPickerContainer />;
      case "time-logging":
        return <TimelineImage />;
      case "pattern-view":
        return <GridImage />;
      case "note-taking":
        return <NoteImage />;
      case "notifications":
        return <NotificationTableContainer />;
      default:
        return null;
    }
  };

  // Unified layout for all pages
  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        {pageData.title && (
          <View style={styles.textContainer}>
            <Text style={styles.title}>{pageData.title}</Text>
          </View>
        )}

        {pageData.content && (
          <View style={styles.textContainer}>
            <Text style={styles.content}>{pageData.content}</Text>
          </View>
        )}

        <View style={styles.embeddedContent}>{renderPageContent()}</View>

        {pageData.footer && (
          <Text style={styles.footerText}>{pageData.footer}</Text>
        )}

        {pageData.actionButton && pageData.actionButton.text && pageData.actionButton.onPress && (
          <CdButton
            title={pageData.actionButton.text}
            onPress={pageData.actionButton.onPress}
            variant="outline"
            style={pageData.type === "notifications" ? styles.notificationActionButton : styles.actionButton}
          />
        )}
      </View>
    </View>
  );
};
