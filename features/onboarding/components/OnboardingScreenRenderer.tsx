import React from "react";
import { Text, View } from "react-native";
import { onboardingStyles as styles } from "../styles";
import { OnboardingScreenProps } from "../types";
import { ActivityPicker } from "./ui/ActivityPicker";
import { GridImage } from "./ui/GridImage";
import { NoteImage } from "./ui/NoteImage";
import { NotificationTable } from "./ui/NotificationTable";
import { TimelineImage } from "./ui/TimelineImage";

export const OnboardingScreenRenderer: React.FC<OnboardingScreenProps> = ({
  pageData,
}) => {
  const renderPageContent = () => {
    switch (pageData.type) {
      case "activity-selection":
        return <ActivityPicker footer={pageData.footer} />;
      case "time-logging":
        return <TimelineImage />;
      case "pattern-view":
        return <GridImage />;
      case "note-taking":
        return <NoteImage />;
      case "notifications":
        return <NotificationTable actionButton={pageData.actionButton} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{pageData.title}</Text>
        </View>
        {pageData.content && (
          <View style={styles.textContainer}>
            <Text style={styles.content}>{pageData.content}</Text>
          </View>
        )}

        <View style={styles.embeddedContent}>{renderPageContent()}</View>

        {pageData.footer && pageData.type !== "activity-selection" && (
          <Text style={styles.footerText}>{pageData.footer}</Text>
        )}
      </View>
    </View>
  );
};
