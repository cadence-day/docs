import React from "react";
import { Image, ImageStyle, Dimensions } from "react-native";

interface TimelineImageProps {
  style?: ImageStyle;
}

const { width: screenWidth } = Dimensions.get('window');

export const TimelineImage: React.FC<TimelineImageProps> = ({ style }) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/timeline.png")}
      style={[
        {
          width: screenWidth * 0.9,
          height: screenWidth * 0.7,
          resizeMode: "contain",
        },
        style
      ]}
    />
  );
};
