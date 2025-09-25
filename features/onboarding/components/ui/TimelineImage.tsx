import React from "react";
import { Image, ImageStyle } from "react-native";

interface TimelineImageProps {
  width?: number;
  style?: ImageStyle;
}

export const TimelineImage: React.FC<TimelineImageProps> = ({
  width,
  style
}) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/timeline.png")}
      style={[
        {
          width: width || "100%",
          resizeMode: "contain"
        },
        style
      ]}
    />
  );
};