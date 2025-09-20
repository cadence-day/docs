import * as React from "react";
import { Text, View } from "react-native";
import { reflectionStyles } from "../styles";

interface LineItemProps {
  label: string;
  value: string;
  isNote?: boolean;
}

const LineItem: React.FC<LineItemProps> = ({
  label,
  value,
  isNote = false,
}: LineItemProps) => {
  return (
    <View
      style={
        isNote
          ? reflectionStyles.lineItemNoteContainer
          : reflectionStyles.lineItemContainer
      }
    >
      <Text style={reflectionStyles.lineItemLabel}>{label.toUpperCase()}</Text>
      <Text
        style={
          isNote
            ? reflectionStyles.lineItemNote
            : reflectionStyles.lineItemValue
        }
      >
        {value}
      </Text>
    </View>
  );
};

export default LineItem;
