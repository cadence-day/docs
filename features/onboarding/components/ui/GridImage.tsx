import React from "react";
import { Image, ImageStyle } from "react-native";

interface GridImageProps {
  width?: number;
  style?: ImageStyle;
}

export const GridImage: React.FC<GridImageProps> = ({
  width,
  style
}) => {
  return (
    <Image
      source={require("@/assets/images/onboarding/grid.png")}
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