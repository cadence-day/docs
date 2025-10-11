import React from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { cadenceUIStyles } from "./styles";

export interface ScreenHeaderProps {
  title: string | React.ReactNode;
  onTitlePress?: () => void;
  subtitle?: React.ReactNode;
  OnRightElement?: () => React.ReactNode;
  onSubtitlePress?: () => void;
  subtitleStyle?: TextStyle;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onTitlePress,
  subtitle,
  OnRightElement,
  onSubtitlePress,
  subtitleStyle,
  style,
  titleStyle,
}) => {
  return (
    <View style={[cadenceUIStyles.screenHeaderContainer, style]}>
      <View style={cadenceUIStyles.screenHeaderLeftSection}>
        {typeof title === "string" ? (
          <TouchableOpacity onPress={onTitlePress}>
            <Text style={[cadenceUIStyles.screenHeaderTitle, titleStyle]}>
              {title}
            </Text>
          </TouchableOpacity>
        ) : (
          title
        )}
        {subtitle && (
          <TouchableOpacity
            onPress={onSubtitlePress}
            disabled={!onSubtitlePress}
            style={cadenceUIStyles.screenHeaderSubtitleContainer}
          >
            {typeof subtitle === "string" ? (
              <Text
                style={[cadenceUIStyles.screenHeaderSubtitle, subtitleStyle]}
              >
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </TouchableOpacity>
        )}
      </View>
      {OnRightElement && (
        <View style={cadenceUIStyles.screenHeaderRightSection}>
          {OnRightElement()}
        </View>
      )}
    </View>
  );
};
