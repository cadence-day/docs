import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface ShareIconProps {
  size?: number;
  color?: string;
}

const ShareIcon: React.FC<ShareIconProps> = ({
  size = 24,
  color = "#3498db",
}) => {
  return <Ionicons name="share-outline" size={size} color={color} />;
};

export default ShareIcon;
