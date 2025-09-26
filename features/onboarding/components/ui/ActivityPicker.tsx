import useTranslation from "@/shared/hooks/useI18n";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ACTIVITY_PRESETS } from "../../data/activityPresets";
import { useOnboardingStore } from "../../store/useOnboardingStore";
import { onboardingStyles as styles } from "../../styles";

interface ActivityPickerProps {
  footer?: string;
}

export const ActivityPicker: React.FC<ActivityPickerProps> = ({ footer }) => {
  const { t } = useTranslation();
  const { selectedActivities, toggleActivity } = useOnboardingStore();

  const hasSelectedActivities = selectedActivities.length > 0;

  return (
    <>
      <Text style={styles.subtitle}>
        Pick activities that are relevant to you:
      </Text>

      <ScrollView
        style={styles.activitiesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.activitiesGrid}>
          {ACTIVITY_PRESETS.map((preset) => {
            const isSelected = selectedActivities.includes(preset.id);
            const shouldDimUnselected = hasSelectedActivities && !isSelected;

            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.activityTag,
                  isSelected && styles.activityTagSelected,
                  shouldDimUnselected && styles.activityTagDimmed,
                ]}
                onPress={() => toggleActivity(preset.id)}
              >
                <Text
                  style={[
                    styles.activityTagText,
                    isSelected && styles.activityTagTextSelected,
                    shouldDimUnselected && styles.activityTagTextDimmed,
                  ]}
                >
                  {t(preset.nameKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {footer && <Text style={styles.footerText}>{footer}</Text>}
    </>
  );
};
