import React from "react";
import { View } from "react-native";
import SageIcon from "@/shared/components/icons/SageIcon";
import { sageIconStyles } from "../../styles";

const SageIconContainer: React.FC = () => (
  <View style={sageIconStyles.container}>
    <SageIcon status="pulsating" size={90} />
  </View>
);

export default SageIconContainer;