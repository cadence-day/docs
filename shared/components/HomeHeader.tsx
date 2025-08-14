import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface HomeHeaderProps {
  title: string;
  subtitle: string | React.ReactNode;
  rightButtonTitle?: string | React.ReactNode;
  onRightButtonPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  title,
  subtitle,
  rightButtonTitle,
  onRightButtonPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {typeof subtitle === "string" ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          subtitle
        )}
      </View>
      {rightButtonTitle && (
        <TouchableOpacity
          onPress={onRightButtonPress}
          style={styles.rightButton}
        >
          {typeof rightButtonTitle === "string" ? (
            <Text style={styles.rightButtonText}>{rightButtonTitle}</Text>
          ) : (
            rightButtonTitle
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  rightButton: {
    marginLeft: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 16,
  },
  rightButtonText: {
    fontSize: 16,
    color: "#6646EC",
    fontWeight: "600",
  },
});

export default HomeHeader;
