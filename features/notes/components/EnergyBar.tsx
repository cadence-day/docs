import * as Haptics from "expo-haptics";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";
import type { EnergyBarProps } from "../types";

export const EnergyBar: React.FC<EnergyBarProps> = ({
  level,
  isActive,
  onPress,
}) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.energyBar,
        isActive ? styles.energyBarActive : styles.energyBarInactive,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.energyBarText}>{level}</Text>
    </TouchableOpacity>
  );
};
