import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={[styles.container, style]}>
      <View style={styles.leftSection}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle && (
          <TouchableOpacity
            onPress={onSubtitlePress}
            disabled={!onSubtitlePress}
            style={styles.subtitleContainer}
          >
            {typeof subtitle === "string" ? (
              <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
            ) : (
              subtitle
            )}
          </TouchableOpacity>
        )}
      </View>
      {OnRightElement && (
        <View style={styles.rightSection}>{OnRightElement()}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: "#222",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
