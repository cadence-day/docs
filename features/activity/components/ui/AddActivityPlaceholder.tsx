import React from "react";
import { Text, View, ViewStyle } from "react-native";

import { useI18n } from "@/shared/hooks/useI18n";

interface AddActivityPlaceholderBoxProps {
  style?: ViewStyle;
  boxHeight?: number;
  boxWidth?: number | `${number}%`;
  showTitle?: boolean;
  marginBottom?: number;
  onPress?: () => void;
}

import { ADD_PLACEHOLDER_BORDER } from "@/features/activity/constants";
import { styles } from "@/features/activity/styles";
import { TouchableOpacity } from "react-native";

export const AddActivityPlaceholder: React.FC<
  AddActivityPlaceholderBoxProps
> = ({
  style,
  boxHeight = 28,
  boxWidth = "100%",
  showTitle = true,
  marginBottom = 8,
  onPress,
}) => {
  const { t } = useI18n();
  const content = (
    <>
      <View
        style={[
          styles.activityBox,
          {
            backgroundColor: "#323232",
            height: boxHeight,
            width: boxWidth,
            marginBottom: marginBottom,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            borderColor: ADD_PLACEHOLDER_BORDER,
            borderWidth: 2,
          } as ViewStyle,
        ]}
      >
        <Text style={styles.plusIcon}>+</Text>
      </View>
      {showTitle && (
        <View style={styles.placeholderTextContainer}>
          <Text style={styles.addText}>{t("add-new-activity")}</Text>
        </View>
      )}
    </>
  );
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.container, style]}>{content}</View>;
};

// uses centralized styles
