import useTranslation from "@/shared/hooks/useI18n";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ACTIVITY_PRESETS } from "../../data/activityPresets";
import { onboardingStyles as styles } from "../../styles";
import { OnboardingPage } from "../../types";

interface ActivitySelectionScreenProps {
  pageData: OnboardingPage;
  onActivitiesChange?: (activities: string[]) => void;
}

export const ActivitySelectionScreen: React.FC<
  ActivitySelectionScreenProps
> = ({ pageData, onActivitiesChange }) => {
  const { t } = useTranslation();
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    pageData.selectedActivities || []
  );

  const toggleActivity = (activityId: string) => {
    const newSelected = selectedActivities.includes(activityId)
      ? selectedActivities.filter((id) => id !== activityId)
      : [...selectedActivities, activityId];

    setSelectedActivities(newSelected);
    onActivitiesChange?.(newSelected);
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{pageData.title}</Text>
        <Text style={styles.content}>{pageData.content}</Text>

        <Text style={styles.subtitle}>
          Pick activities that are relevant to you:
        </Text>

        <ScrollView
          style={styles.activitiesContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.activitiesGrid}>
            {ACTIVITY_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.activityTag,
                  selectedActivities.includes(preset.id) &&
                    styles.activityTagSelected,
                ]}
                onPress={() => toggleActivity(preset.id)}
              >
                <Text
                  style={[
                    styles.activityTagText,
                    selectedActivities.includes(preset.id) &&
                      styles.activityTagTextSelected,
                  ]}
                >
                  {t(preset.nameKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {pageData.footer && (
          <Text style={styles.footerText}>{pageData.footer}</Text>
        )}
      </View>
    </View>
  );
};
