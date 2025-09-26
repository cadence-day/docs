import React from "react";
import { Image, ImageStyle } from "react-native";
import { onboardingStyles as styles } from "../../styles";
interface GridImageProps {
  style?: ImageStyle;
}

export const GridImage: React.FC<GridImageProps> = ({ style }) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/grid.png")}
      style={[styles.pictureContainer, style]}
    />
  );
};
