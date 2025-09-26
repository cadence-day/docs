import useTranslation from "@/shared/hooks/useI18n";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ACTIVITY_PRESETS } from "../../data/activityPresets";
import { onboardingStyles as styles } from "../../styles";

interface ActivityPickerProps {
  footer?: string;
  selectedActivities: string[];
  onToggleActivity: (activityId: string) => void;
}

export const ActivityPicker: React.FC<ActivityPickerProps> = ({
  footer,
  selectedActivities,
  onToggleActivity,
}) => {
  const { t } = useTranslation();
  const hasSelectedActivities = selectedActivities.length > 0;

  return (
    <>
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
                onPress={() => onToggleActivity(preset.id)}
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
