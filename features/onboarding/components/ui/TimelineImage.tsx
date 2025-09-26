import React from "react";
import { Image, ImageStyle } from "react-native";
import { onboardingStyles as styles } from "../../styles";

interface TimelineImageProps {
  style?: ImageStyle;
}

export const TimelineImage: React.FC<TimelineImageProps> = ({ style }) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/timeline.png")}
      style={[
        styles.pictureContainer, // Use the defined style for consistent sizing},
        style,
      ]}
    />
  );
};
