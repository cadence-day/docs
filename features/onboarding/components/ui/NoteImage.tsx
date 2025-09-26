import React from "react";
import { Image, ImageStyle } from "react-native";
import { onboardingStyles as styles } from "../../styles";
interface NoteImageProps {
  style?: ImageStyle;
}

export const NoteImage: React.FC<NoteImageProps> = ({ style }) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/note.png")}
      style={[styles.pictureContainer, style]}
    />
  );
};
