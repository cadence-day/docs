import React from "react";
import { Image, ImageStyle } from "react-native";

interface NoteImageProps {
  width?: number;
  style?: ImageStyle;
}

export const NoteImage: React.FC<NoteImageProps> = ({
  width,
  style
}) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/note.png")}
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