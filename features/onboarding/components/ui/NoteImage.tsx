import React from "react";
import { Image, ImageStyle, Dimensions } from "react-native";

interface NoteImageProps {
  style?: ImageStyle;
}

const { width: screenWidth } = Dimensions.get('window');

export const NoteImage: React.FC<NoteImageProps> = ({ style }) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/note.png")}
      style={[
        {
          width: screenWidth * 0.9,
          height: screenWidth * 0.65,
          resizeMode: "contain",
        },
        style
      ]}
    />
  );
};
