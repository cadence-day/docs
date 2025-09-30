import React from "react";
import {
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cadenceUIStyles } from "./styles";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  OnRightElement?: () => React.ReactNode;
  onSubtitlePress?: () => void;
  subtitleStyle?: TextStyle;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  OnRightElement,
  onSubtitlePress,
  subtitleStyle,
  style,
  titleStyle,
}) => {
  return (
    <SafeAreaView style={[cadenceUIStyles.screenHeaderContainer, style]}>
      <View style={cadenceUIStyles.screenHeaderLeftSection}>
        <Text style={[cadenceUIStyles.screenHeaderTitle, titleStyle]}>
          {title}
        </Text>
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
    </SafeAreaView>
  );
};
