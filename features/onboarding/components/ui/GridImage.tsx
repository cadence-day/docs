import React from "react";
import { Image, ImageStyle, Dimensions } from "react-native";

interface GridImageProps {
  style?: ImageStyle;
}

const { width: screenWidth } = Dimensions.get('window');

export const GridImage: React.FC<GridImageProps> = ({ style }) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/grid.png")}
      style={[
        {
          width: screenWidth * 0.9,
          height: screenWidth * 0.6,
          resizeMode: "contain",
        },
        style
      ]}
    />
  );
};
